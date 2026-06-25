import { useCallback, useEffect, useRef } from 'react';

import {
  getActiveScrollSection,
  getObservedScrollLocationRects,
  getScrollTargetKey,
} from './scrollspyUtils.js';

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

function resolveViewportTopOffset(viewportTopOffset) {
  return typeof viewportTopOffset === 'function'
    ? viewportTopOffset()
    : viewportTopOffset;
}

export function useAdminScrollspy({
  observedLeafId,
  enabled = true,
  getTargetElement,
  locations,
  onObservedLeafChange,
  viewportTopOffset = 0,
}) {
  const observedLeafIdRef = useRef(observedLeafId);
  const onObservedLeafChangeRef = useRef(onObservedLeafChange);
  observedLeafIdRef.current = observedLeafId;
  onObservedLeafChangeRef.current = onObservedLeafChange;

  const updateActiveSection = useCallback(() => {
    if (!enabled || typeof window === 'undefined' || typeof document === 'undefined') return;

    const sectionRects = getObservedScrollLocationRects(locations, getTargetElement);
    const resolvedViewportTopOffset = resolveViewportTopOffset(viewportTopOffset);

    const nextSectionId = getActiveScrollSection(sectionRects, {
      ...getScrollMetrics(),
      currentSectionId: observedLeafIdRef.current,
      viewportTop: resolvedViewportTopOffset,
    });

    if (nextSectionId && nextSectionId !== observedLeafIdRef.current) {
      observedLeafIdRef.current = nextSectionId;
      onObservedLeafChangeRef.current?.(nextSectionId);
    }
  }, [enabled, getTargetElement, locations, viewportTopOffset]);

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
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled, updateActiveSection]);

  return { updateActiveSection };
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

  return {
    getTargetElement,
    setTargetRef,
  };
}

export default useAdminScrollspy;
