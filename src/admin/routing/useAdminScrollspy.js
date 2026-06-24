import { useCallback, useEffect, useRef } from 'react';

import {
  getActiveScrollSection,
  getObservedScrollLocationRects,
  getScrollTargetKey,
  isScrollSectionAcceptablyVisible,
} from './scrollspyUtils.js';

const PROGRAMMATIC_SCROLL_TIMEOUT_MS = 1200;
const INSTANT_SCROLL_TIMEOUT_MS = 80;

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
    viewportTop: 0,
    viewportHeight,
  };
}

function resolveViewportTopOffset(viewportTopOffset, activeSectionId) {
  return typeof viewportTopOffset === 'function'
    ? viewportTopOffset(activeSectionId)
    : viewportTopOffset;
}

export function useAdminScrollspy({
  activeSectionId,
  enabled = true,
  getTargetElement,
  locations,
  onActiveSectionChange,
  viewportTopOffset = 0,
}) {
  const activeSectionIdRef = useRef(activeSectionId);
  const onActiveSectionChangeRef = useRef(onActiveSectionChange);
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef(null);
  const removeScrollEndListenerRef = useRef(null);

  useEffect(() => {
    activeSectionIdRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    onActiveSectionChangeRef.current = onActiveSectionChange;
  }, [onActiveSectionChange]);

  const updateActiveSection = useCallback(() => {
    if (!enabled || typeof window === 'undefined' || typeof document === 'undefined') return;
    if (programmaticScrollRef.current) return;

    const sectionRects = getObservedScrollLocationRects(locations, getTargetElement);
    const resolvedViewportTopOffset = resolveViewportTopOffset(
      viewportTopOffset,
      activeSectionIdRef.current,
    );

    const nextSectionId = getActiveScrollSection(sectionRects, {
      ...getScrollMetrics(),
      currentSectionId: activeSectionIdRef.current,
      viewportTop: resolvedViewportTopOffset,
    });

    if (nextSectionId && nextSectionId !== activeSectionIdRef.current) {
      activeSectionIdRef.current = nextSectionId;
      onActiveSectionChangeRef.current?.(nextSectionId);
    }
  }, [enabled, getTargetElement, locations, viewportTopOffset]);

  const releaseProgrammaticScroll = useCallback(() => {
    window.clearTimeout(programmaticScrollTimeoutRef.current);
    removeScrollEndListenerRef.current?.();
    removeScrollEndListenerRef.current = null;
    programmaticScrollRef.current = false;
    window.requestAnimationFrame(updateActiveSection);
  }, [updateActiveSection]);

  const scrollToTarget = useCallback((scrollTarget, options = {}) => {
    const element = getTargetElement(scrollTarget);
    if (!element || typeof window === 'undefined') return false;

    const resolvedViewportTopOffset = options.viewportTopOffset
      ?? resolveViewportTopOffset(viewportTopOffset, activeSectionIdRef.current);

    if (options.skipIfVisible && isScrollSectionAcceptablyVisible(element.getBoundingClientRect(), {
      ...getScrollMetrics(),
      viewportTop: resolvedViewportTopOffset,
    })) {
      return true;
    }

    const shouldReduceMotion = prefersReducedMotion();
    const behavior = shouldReduceMotion ? 'auto' : 'smooth';

    programmaticScrollRef.current = true;
    window.clearTimeout(programmaticScrollTimeoutRef.current);
    removeScrollEndListenerRef.current?.();
    removeScrollEndListenerRef.current = null;
    element.scrollIntoView({ block: 'start', behavior });

    if (!shouldReduceMotion && 'onscrollend' in window) {
      const handleScrollEnd = () => releaseProgrammaticScroll();
      window.addEventListener('scrollend', handleScrollEnd, { once: true });
      removeScrollEndListenerRef.current = () => {
        window.removeEventListener('scrollend', handleScrollEnd);
      };
    }

    programmaticScrollTimeoutRef.current = window.setTimeout(
      releaseProgrammaticScroll,
      shouldReduceMotion ? INSTANT_SCROLL_TIMEOUT_MS : PROGRAMMATIC_SCROLL_TIMEOUT_MS,
    );

    return true;
  }, [getTargetElement, releaseProgrammaticScroll, viewportTopOffset]);

  const scrollToSection = useCallback((sectionId, options = {}) => {
    const location = locations.find(({ id }) => id === sectionId);
    return location
      ? scrollToTarget(location.scrollTarget, options)
      : false;
  }, [locations, scrollToTarget]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    let animationFrame = null;
    const handleScroll = () => {
      if (animationFrame !== null) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updateActiveSection();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    window.requestAnimationFrame(updateActiveSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.clearTimeout(programmaticScrollTimeoutRef.current);
      removeScrollEndListenerRef.current?.();
      removeScrollEndListenerRef.current = null;
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled, updateActiveSection]);

  return {
    scrollToSection,
    scrollToTarget,
  };
}

export function useAdminScrollTargetRegistry() {
  const targetElementsRef = useRef(new Map());

  const setTargetRef = useCallback((target, element) => {
    const targetKey = getScrollTargetKey(target);
    if (!targetKey) return;

    if (element) {
      targetElementsRef.current.set(targetKey, element);
    } else {
      targetElementsRef.current.delete(targetKey);
    }
  }, []);

  const getTargetElement = useCallback((target) => {
    const targetKey = getScrollTargetKey(target);
    return targetKey
      ? targetElementsRef.current.get(targetKey) || null
      : null;
  }, []);

  const getObservationRects = useCallback((locations) => (
    getObservedScrollLocationRects(locations, getTargetElement)
  ), [getTargetElement]);

  return {
    getObservationRects,
    getTargetElement,
    setTargetRef,
  };
}

export default useAdminScrollspy;
