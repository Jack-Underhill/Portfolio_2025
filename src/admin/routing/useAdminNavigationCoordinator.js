import { useCallback, useEffect, useRef, useState } from 'react';

import { isScrollSectionAcceptablyVisible } from './scrollspyUtils.js';

const NAVIGATION_PHASES = Object.freeze({
  IDLE: 'idle',
  NAVIGATING: 'navigating',
});

const NAVIGATION_SETTLE_TOLERANCE_PX = 24;
const NAVIGATION_FALLBACK_TIMEOUT_MS = 1600;
const REDUCED_MOTION_SETTLE_FRAMES = 2;
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

export function useAdminNavigationCoordinator({
  getTargetElement,
  initialObservedLeafId = null,
  onNavigateRoute,
  onObservedLeafChange,
  onObservedRouteReplace,
}) {
  const [navigationPhase, setNavigationPhase] = useState(NAVIGATION_PHASES.IDLE);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const navigationTargetRef = useRef(null);
  const observedLeafIdRef = useRef(initialObservedLeafId);
  const settleFrameRef = useRef(null);
  const settleTimeoutRef = useRef(null);
  const removeScrollEndListenerRef = useRef(null);
  const onNavigateRouteRef = useRef(onNavigateRoute);
  const onObservedLeafChangeRef = useRef(onObservedLeafChange);
  const onObservedRouteReplaceRef = useRef(onObservedRouteReplace);

  useEffect(() => {
    onNavigateRouteRef.current = onNavigateRoute;
  }, [onNavigateRoute]);

  useEffect(() => {
    onObservedLeafChangeRef.current = onObservedLeafChange;
  }, [onObservedLeafChange]);

  useEffect(() => {
    onObservedRouteReplaceRef.current = onObservedRouteReplace;
  }, [onObservedRouteReplace]);

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

  const releaseNavigation = useCallback((reason = 'settled') => {
    const hadNavigationTarget = Boolean(navigationTargetRef.current);
    clearSettleLifecycle();
    navigationTargetRef.current = null;
    setNavigationTarget(null);
    setNavigationPhase(NAVIGATION_PHASES.IDLE);

    if (hadNavigationTarget && reason === 'interrupted' && observedLeafIdRef.current) {
      onObservedRouteReplaceRef.current?.(observedLeafIdRef.current);
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

  const scrollToTarget = useCallback((scrollTarget, options = {}) => {
    if (typeof window === 'undefined') return false;

    const element = getTargetElement(scrollTarget);
    if (!element) return false;

    if (options.skipIfVisible && isScrollSectionAcceptablyVisible(element.getBoundingClientRect(), {
      ...getScrollMetrics(),
      viewportTop: options.viewportTopOffset ?? getElementScrollMarginTop(element),
    })) {
      return true;
    }

    const behavior = options.behavior
      || (prefersReducedMotion() ? 'auto' : 'smooth');
    element.scrollIntoView({ block: 'start', behavior });
    return true;
  }, [getTargetElement]);

  const navigateToTarget = useCallback((target) => {
    if (!target?.path || !target?.scrollTarget) return false;

    clearSettleLifecycle();
    navigationTargetRef.current = target;
    setNavigationTarget(target);
    setNavigationPhase(NAVIGATION_PHASES.NAVIGATING);
    onNavigateRouteRef.current?.(target.path);

    const element = getTargetElement(target.scrollTarget);
    if (!element || typeof window === 'undefined') {
      releaseNavigation();
      return false;
    }

    const shouldReduceMotion = prefersReducedMotion();
    element.scrollIntoView({
      block: 'start',
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
    monitorNavigationSettlement(element, shouldReduceMotion);
    return true;
  }, [
    clearSettleLifecycle,
    getTargetElement,
    monitorNavigationSettlement,
    releaseNavigation,
  ]);

  const handleObservedLeafChange = useCallback((leafId) => {
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
    };
  }, [clearSettleLifecycle, releaseNavigation]);

  return {
    handleObservedLeafChange,
    navigateToTarget,
    navigationPhase,
    navigationTarget,
    releaseNavigation,
    scrollToTarget,
  };
}

export default useAdminNavigationCoordinator;
