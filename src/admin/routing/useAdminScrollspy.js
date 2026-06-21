import { useCallback, useEffect, useRef } from 'react';

import { getActiveScrollSection } from './scrollspyUtils.js';

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

export function useAdminScrollspy({
  activeSectionId,
  enabled = true,
  onActiveSectionChange,
  sectionIds,
  viewportTopOffset = 0,
}) {
  const sectionElementsRef = useRef(new Map());
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

  const setSectionRef = useCallback((sectionId, element) => {
    if (!sectionId) return;

    if (element) {
      sectionElementsRef.current.set(sectionId, element);
    } else {
      sectionElementsRef.current.delete(sectionId);
    }
  }, []);

  const getSectionElement = useCallback((sectionId) => {
    if (sectionElementsRef.current.has(sectionId)) {
      return sectionElementsRef.current.get(sectionId);
    }

    if (typeof document === 'undefined') return null;
    return document.getElementById(sectionId);
  }, []);

  const updateActiveSection = useCallback(() => {
    if (!enabled || typeof window === 'undefined' || typeof document === 'undefined') return;
    if (programmaticScrollRef.current) return;

    const sectionRects = sectionIds
      .map((id) => {
        const element = getSectionElement(id);
        return element
          ? { id, rect: element.getBoundingClientRect() }
          : null;
      })
      .filter(Boolean);

    const nextSectionId = getActiveScrollSection(sectionRects, {
      ...getScrollMetrics(),
      currentSectionId: activeSectionIdRef.current,
      viewportTop: viewportTopOffset,
    });

    if (nextSectionId && nextSectionId !== activeSectionIdRef.current) {
      activeSectionIdRef.current = nextSectionId;
      onActiveSectionChangeRef.current?.(nextSectionId);
    }
  }, [enabled, getSectionElement, sectionIds, viewportTopOffset]);

  const releaseProgrammaticScroll = useCallback(() => {
    window.clearTimeout(programmaticScrollTimeoutRef.current);
    removeScrollEndListenerRef.current?.();
    removeScrollEndListenerRef.current = null;
    programmaticScrollRef.current = false;
    window.requestAnimationFrame(updateActiveSection);
  }, [updateActiveSection]);

  const scrollToSection = useCallback((sectionId) => {
    const element = getSectionElement(sectionId);
    if (!element || typeof window === 'undefined') return false;

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
  }, [getSectionElement, releaseProgrammaticScroll]);

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
    setSectionRef,
  };
}

export default useAdminScrollspy;
