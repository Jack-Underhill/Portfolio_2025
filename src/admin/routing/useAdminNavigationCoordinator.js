import { useCallback, useEffect, useRef, useState } from 'react';

import { isScrollSectionAcceptablyVisible } from './scrollspyUtils.js';

const NAVIGATION_PHASES = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  NAVIGATING: 'navigating',
  STABILIZING: 'stabilizing',
});

const NAVIGATION_SETTLE_TOLERANCE_PX = 24;
const NAVIGATION_FALLBACK_TIMEOUT_MS = 1600;
const PROJECT_STABILIZATION_MAX_FRAMES = 12;
const PROJECT_STABILIZATION_STABLE_FRAMES = 2;
const PROJECT_STABILIZATION_TOLERANCE_PX = 1;
const REDUCED_MOTION_SETTLE_FRAMES = 2;
const ROUTE_TARGET_STABLE_FRAMES = 2;
const ROUTE_TARGET_MAX_MEASURE_FRAMES = 24;
const ROUTE_TARGET_POSITION_TOLERANCE_PX = 1;
const SCROLL_INTERRUPTION_KEYS = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
  'Spacebar',
]);

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollMetrics() {
  const documentElement = document.documentElement;
  const scrollTop = window.scrollY || documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || documentElement.clientHeight || 0;

  return {
    scrollTop,
    scrollBottom: scrollTop + viewportHeight,
    scrollHeight: documentElement.scrollHeight || 0,
    viewportHeight,
  };
}

function getElementScrollMarginTop(element) {
  if (!element || typeof window === 'undefined') return 0;

  const scrollMarginTop = window.getComputedStyle(element).scrollMarginTop;
  const parsedScrollMarginTop = Number.parseFloat(scrollMarginTop);
  return Number.isFinite(parsedScrollMarginTop) ? parsedScrollMarginTop : 0;
}

function isEditableElement(element) {
  if (!(element instanceof Element)) return false;

  return Boolean(element.closest(
    'input, textarea, select, [contenteditable=""], [contenteditable="true"]',
  ));
}

function isNavigationTargetSettled(element) {
  const rect = element?.getBoundingClientRect();
  if (!rect) return false;

  const metrics = getScrollMetrics();
  const viewportTop = getElementScrollMarginTop(element);
  const isAligned = Math.abs(rect.top - viewportTop) <= NAVIGATION_SETTLE_TOLERANCE_PX;
  const isAtDocumentEnd = metrics.scrollBottom >= metrics.scrollHeight - NAVIGATION_SETTLE_TOLERANCE_PX;

  return isAligned || (
    isAtDocumentEnd
    && isScrollSectionAcceptablyVisible(rect, {
      alignmentTolerance: NAVIGATION_SETTLE_TOLERANCE_PX,
      viewportHeight: metrics.viewportHeight,
      viewportTop,
    })
  );
}

function getElementDocumentTop(element) {
  const rect = element?.getBoundingClientRect();
  if (!rect || !Number.isFinite(rect.top)) return null;

  return rect.top + (window.scrollY || document.documentElement.scrollTop || 0);
}

function withNavigationOrigin(target, originLeafId) {
  return {
    ...target,
    originLeafId: target.originLeafId ?? originLeafId ?? null,
  };
}

export function useAdminNavigationCoordinator({
  getTargetElement,
  initialObservedLeafId = null,
  onNavigateRoute,
  onNavigationSettled,
  onObservedLeafChange,
  onObservedRouteReplace,
  onProjectStabilizationSettled,
  onRouteTargetFallback,
}) {
  const [navigationPhase, setNavigationPhase] = useState(NAVIGATION_PHASES.IDLE);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const navigationTargetRef = useRef(null);
  const observedLeafIdRef = useRef(initialObservedLeafId);
  const settleFrameRef = useRef(null);
  const settleTimeoutRef = useRef(null);
  const stabilizationFrameRef = useRef(null);
  const stabilizationRef = useRef(null);
  const removeScrollEndListenerRef = useRef(null);
  const onNavigateRouteRef = useRef(onNavigateRoute);
  const onNavigationSettledRef = useRef(onNavigationSettled);
  const onObservedLeafChangeRef = useRef(onObservedLeafChange);
  const onObservedRouteReplaceRef = useRef(onObservedRouteReplace);
  const onProjectStabilizationSettledRef = useRef(onProjectStabilizationSettled);
  const onRouteTargetFallbackRef = useRef(onRouteTargetFallback);
  onNavigateRouteRef.current = onNavigateRoute;
  onNavigationSettledRef.current = onNavigationSettled;
  onObservedLeafChangeRef.current = onObservedLeafChange;
  onObservedRouteReplaceRef.current = onObservedRouteReplace;
  onProjectStabilizationSettledRef.current = onProjectStabilizationSettled;
  onRouteTargetFallbackRef.current = onRouteTargetFallback;

  const clearSettleLifecycle = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = null;
    if (settleFrameRef.current !== null) {
      window.cancelAnimationFrame(settleFrameRef.current);
      settleFrameRef.current = null;
    }
    removeScrollEndListenerRef.current?.();
    removeScrollEndListenerRef.current = null;
  }, []);

  const clearStabilizationLifecycle = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (stabilizationFrameRef.current !== null) {
      window.cancelAnimationFrame(stabilizationFrameRef.current);
      stabilizationFrameRef.current = null;
    }
    stabilizationRef.current = null;
  }, []);

  const releaseProjectStabilization = useCallback(() => {
    if (!stabilizationRef.current) return;

    clearStabilizationLifecycle();
    setNavigationPhase(NAVIGATION_PHASES.IDLE);
    onProjectStabilizationSettledRef.current?.();
  }, [clearStabilizationLifecycle]);

  const releaseNavigation = useCallback((reason = 'settled') => {
    const releasedTarget = navigationTargetRef.current;
    clearSettleLifecycle();
    navigationTargetRef.current = null;
    setNavigationTarget(null);
    setNavigationPhase(NAVIGATION_PHASES.IDLE);

    if (releasedTarget && reason === 'interrupted' && observedLeafIdRef.current) {
      onObservedRouteReplaceRef.current?.(observedLeafIdRef.current);
    } else if (releasedTarget && reason === 'settled') {
      onNavigationSettledRef.current?.({
        observedLeafId: observedLeafIdRef.current,
        target: releasedTarget,
      });
    }
  }, [clearSettleLifecycle]);

  const monitorNavigationSettlement = useCallback((element, shouldReduceMotion) => {
    let measuredFrames = 0;

    const measure = () => {
      if (!navigationTargetRef.current) return;

      measuredFrames += 1;
      if (
        isNavigationTargetSettled(element)
        && (!shouldReduceMotion || measuredFrames >= REDUCED_MOTION_SETTLE_FRAMES)
      ) {
        releaseNavigation();
        return;
      }

      settleFrameRef.current = window.requestAnimationFrame(measure);
    };

    settleFrameRef.current = window.requestAnimationFrame(measure);
    settleTimeoutRef.current = window.setTimeout(
      () => releaseNavigation(),
      shouldReduceMotion ? 160 : NAVIGATION_FALLBACK_TIMEOUT_MS,
    );

    if (!shouldReduceMotion && 'onscrollend' in window) {
      const handleScrollEnd = () => {
        if (isNavigationTargetSettled(element)) {
          releaseNavigation();
        }
      };

      window.addEventListener('scrollend', handleScrollEnd);
      removeScrollEndListenerRef.current = () => {
        window.removeEventListener('scrollend', handleScrollEnd);
      };
    }
  }, [releaseNavigation]);

  const startProgrammaticScroll = useCallback((element) => {
    const shouldReduceMotion = prefersReducedMotion();
    setNavigationPhase(NAVIGATION_PHASES.NAVIGATING);
    element.scrollIntoView({
      block: 'start',
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
    monitorNavigationSettlement(element, shouldReduceMotion);
  }, [monitorNavigationSettlement]);

  const beginProjectRecordStabilization = useCallback((scrollTarget) => {
    if (
      typeof window === 'undefined'
      || navigationTargetRef.current
      || !scrollTarget
    ) {
      return false;
    }

    const element = getTargetElement(scrollTarget);
    const initialRect = element?.getBoundingClientRect();
    if (!initialRect || !Number.isFinite(initialRect.top)) return false;

    clearStabilizationLifecycle();
    stabilizationRef.current = {
      scrollTarget,
      viewportTop: initialRect.top,
    };
    setNavigationPhase(NAVIGATION_PHASES.STABILIZING);

    let measuredFrames = 0;
    let stableFrames = 0;

    const restoreAnchor = () => {
      const stabilization = stabilizationRef.current;
      if (!stabilization) return;

      measuredFrames += 1;
      const currentElement = getTargetElement(stabilization.scrollTarget);
      const currentRect = currentElement?.getBoundingClientRect();

      if (currentRect && Number.isFinite(currentRect.top)) {
        const offset = currentRect.top - stabilization.viewportTop;
        if (Math.abs(offset) <= PROJECT_STABILIZATION_TOLERANCE_PX) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
          window.scrollBy({ top: offset, left: 0, behavior: 'auto' });
        }

        if (stableFrames >= PROJECT_STABILIZATION_STABLE_FRAMES) {
          releaseProjectStabilization();
          return;
        }
      } else {
        stableFrames = 0;
      }

      if (measuredFrames >= PROJECT_STABILIZATION_MAX_FRAMES) {
        releaseProjectStabilization();
        return;
      }

      stabilizationFrameRef.current = window.requestAnimationFrame(restoreAnchor);
    };

    stabilizationFrameRef.current = window.requestAnimationFrame(restoreAnchor);
    return true;
  }, [
    clearStabilizationLifecycle,
    getTargetElement,
    releaseProjectStabilization,
  ]);

  const navigateToTarget = useCallback((target) => {
    if (!target?.path || !target?.scrollTarget) return false;

    const targetWithOrigin = withNavigationOrigin(
      target,
      observedLeafIdRef.current,
    );
    clearSettleLifecycle();
    clearStabilizationLifecycle();
    navigationTargetRef.current = targetWithOrigin;
    setNavigationTarget(targetWithOrigin);
    setNavigationPhase(NAVIGATION_PHASES.NAVIGATING);
    onNavigateRouteRef.current?.(targetWithOrigin.path);

    const element = getTargetElement(targetWithOrigin.scrollTarget);
    if (!element || typeof window === 'undefined') {
      releaseNavigation();
      return false;
    }

    startProgrammaticScroll(element);
    return true;
  }, [
    clearSettleLifecycle,
    clearStabilizationLifecycle,
    getTargetElement,
    releaseNavigation,
    startProgrammaticScroll,
  ]);

  const navigateToRouteTarget = useCallback((target, options = {}) => {
    if (!target?.path || !target?.scrollTarget) return false;

    const currentTarget = navigationTargetRef.current;
    const preservedOriginLeafId = (
      currentTarget?.source === target.source
      && currentTarget?.path === target.path
    )
      ? currentTarget.originLeafId
      : observedLeafIdRef.current;
    const targetWithOrigin = withNavigationOrigin(target, preservedOriginLeafId);
    clearSettleLifecycle();
    clearStabilizationLifecycle();
    navigationTargetRef.current = targetWithOrigin;
    setNavigationTarget(targetWithOrigin);
    setNavigationPhase(NAVIGATION_PHASES.LOADING);

    if (!options.isReady || typeof window === 'undefined') {
      return true;
    }

    const fallbackTargetWithOrigin = options.fallbackTarget
      ? withNavigationOrigin(
          options.fallbackTarget,
          targetWithOrigin.originLeafId,
        )
      : null;
    let activeTarget = targetWithOrigin;
    if (options.shouldUseFallback && fallbackTargetWithOrigin) {
      activeTarget = fallbackTargetWithOrigin;
      navigationTargetRef.current = activeTarget;
      setNavigationTarget(activeTarget);
      onRouteTargetFallbackRef.current?.(activeTarget.path);
    }

    let measuredFrames = 0;
    let stableFrames = 0;
    let previousDocumentTop = null;

    const measureTarget = () => {
      if (navigationTargetRef.current !== activeTarget) return;

      const element = getTargetElement(activeTarget.scrollTarget);
      const documentTop = getElementDocumentTop(element);
      measuredFrames += 1;

      if (documentTop !== null) {
        stableFrames = previousDocumentTop !== null
          && Math.abs(documentTop - previousDocumentTop) <= ROUTE_TARGET_POSITION_TOLERANCE_PX
          ? stableFrames + 1
          : 1;
        previousDocumentTop = documentTop;

        if (stableFrames >= ROUTE_TARGET_STABLE_FRAMES) {
          settleFrameRef.current = null;
          startProgrammaticScroll(element);
          return;
        }
      } else {
        stableFrames = 0;
        previousDocumentTop = null;
      }

      if (measuredFrames >= ROUTE_TARGET_MAX_MEASURE_FRAMES) {
        if (
          fallbackTargetWithOrigin?.path
          && fallbackTargetWithOrigin?.scrollTarget
          && activeTarget !== fallbackTargetWithOrigin
        ) {
          activeTarget = fallbackTargetWithOrigin;
          measuredFrames = 0;
          stableFrames = 0;
          previousDocumentTop = null;
          navigationTargetRef.current = fallbackTargetWithOrigin;
          setNavigationTarget(fallbackTargetWithOrigin);
          onRouteTargetFallbackRef.current?.(fallbackTargetWithOrigin.path);
          settleFrameRef.current = window.requestAnimationFrame(measureTarget);
          return;
        }

        releaseNavigation();
        return;
      }

      settleFrameRef.current = window.requestAnimationFrame(measureTarget);
    };

    settleFrameRef.current = window.requestAnimationFrame(measureTarget);
    return true;
  }, [
    clearSettleLifecycle,
    clearStabilizationLifecycle,
    getTargetElement,
    releaseNavigation,
    startProgrammaticScroll,
  ]);

  const handleObservedLeafChange = useCallback((leafId) => {
    if (stabilizationRef.current) return;

    observedLeafIdRef.current = leafId;
    onObservedLeafChangeRef.current?.(leafId);

    if (!navigationTargetRef.current) {
      onObservedRouteReplaceRef.current?.(leafId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const interruptNavigation = () => {
      if (navigationTargetRef.current) {
        releaseNavigation('interrupted');
      }
    };
    const handleKeyDown = (event) => {
      if (
        navigationTargetRef.current
        && SCROLL_INTERRUPTION_KEYS.has(event.key)
        && !isEditableElement(event.target)
      ) {
        interruptNavigation();
      }
    };
    const handlePointerDown = (event) => {
      const scrollbarLeftEdge = document.documentElement.clientWidth;
      if (event.button === 1 || event.clientX >= scrollbarLeftEdge) {
        interruptNavigation();
      }
    };

    window.addEventListener('wheel', interruptNavigation, { passive: true });
    window.addEventListener('touchstart', interruptNavigation, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', interruptNavigation);
      window.removeEventListener('touchstart', interruptNavigation);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      clearSettleLifecycle();
      clearStabilizationLifecycle();
    };
  }, [clearSettleLifecycle, clearStabilizationLifecycle, releaseNavigation]);

  return {
    beginProjectRecordStabilization,
    handleObservedLeafChange,
    navigateToTarget,
    navigateToRouteTarget,
    navigationPhase,
    navigationTarget,
    releaseNavigation,
  };
}

export default useAdminNavigationCoordinator;
