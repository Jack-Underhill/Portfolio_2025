import { useCallback, useEffect, useRef, useState } from 'react';

// Negative slope lets multi-column grids activate left-to-right while scrolling down.
const DEFAULT_SLOPE = -0.35;
const DEFAULT_ACTIVATION_BAND = 350;
const DEFAULT_MIN_VISIBLE_RATIO = 0.2;
const DEFAULT_HYSTERESIS = 24;
const COARSE_POINTER_QUERY = '(any-pointer: coarse)';

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getActivationLineYAtX(
  x,
  {
    viewportCenterX,
    viewportCenterY,
    slope = DEFAULT_SLOPE,
  },
) {
  return viewportCenterY + slope * (x - viewportCenterX);
}

export function getVisibleRatio(rect, viewportWidth, viewportHeight) {
  const width = rect.width ?? rect.right - rect.left;
  const height = rect.height ?? rect.bottom - rect.top;

  if (width <= 0 || height <= 0) return 0;

  const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

  return (visibleWidth * visibleHeight) / (width * height);
}

export function scoreRectAgainstActivationLine(
  rect,
  {
    viewportWidth,
    viewportHeight,
    slope = DEFAULT_SLOPE,
  },
) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const lineY = getActivationLineYAtX(centerX, {
    viewportCenterX: viewportWidth / 2,
    viewportCenterY: viewportHeight / 2,
    slope,
  });

  return {
    centerX,
    centerY,
    lineY,
    distance: Math.abs(centerY - lineY),
    visibleRatio: getVisibleRatio(rect, viewportWidth, viewportHeight),
  };
}

export function chooseViewportActiveItem(
  items,
  {
    viewportWidth,
    viewportHeight,
    currentActiveId = null,
    activationBand = DEFAULT_ACTIVATION_BAND,
    minVisibleRatio = DEFAULT_MIN_VISIBLE_RATIO,
    slope = DEFAULT_SLOPE,
    hysteresis = DEFAULT_HYSTERESIS,
  },
) {
  const scoredItems = items
    .map((item) => ({
      ...item,
      score: scoreRectAgainstActivationLine(item.rect, {
        viewportWidth,
        viewportHeight,
        slope,
      }),
    }))
    .filter((item) => item.score.visibleRatio >= minVisibleRatio);

  if (scoredItems.length === 0) return null;

  const currentItem = scoredItems.find((item) => Object.is(item.id, currentActiveId)) ?? null;
  const eligibleItems = scoredItems
    .filter((item) => item.score.distance <= activationBand)
    .sort((a, b) => a.score.distance - b.score.distance);

  const winner = eligibleItems[0] ?? null;
  const canKeepCurrent = currentItem && currentItem.score.distance <= activationBand + hysteresis;

  if (!winner && canKeepCurrent) return currentItem.id;
  if (!winner) return null;
  if (!currentItem || Object.is(winner.id, currentItem.id)) return winner.id;
  if (!canKeepCurrent) return winner.id;

  const winnerImprovement = currentItem.score.distance - winner.score.distance;

  return winnerImprovement >= hysteresis ? winner.id : currentItem.id;
}

function useViewportActivationGroup({
  enabled,
  activationBand = DEFAULT_ACTIVATION_BAND,
  minVisibleRatio = DEFAULT_MIN_VISIBLE_RATIO,
  slope = DEFAULT_SLOPE,
  hysteresis = DEFAULT_HYSTERESIS,
  disabled = false,
} = {}) {
  const [activeId, setActiveId] = useState(null);
  const [hasCoarsePointer, setHasCoarsePointer] = useState(false);
  const [scrollMeasurementVersion, setScrollMeasurementVersion] = useState(0);

  const activeIdRef = useRef(activeId);
  const nodesRef = useRef(new Map());
  const rafIdRef = useRef(null);
  const pendingMeasurementReasonRef = useRef('layout');
  const refCallbacksRef = useRef(new Map());
  const optionsRef = useRef({
    enabled: false,
    activationBand,
    minVisibleRatio,
    slope,
    hysteresis,
    disabled,
  });

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!canUseDOM() || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(COARSE_POINTER_QUERY);
    const syncPointerCapability = () => setHasCoarsePointer(mediaQuery.matches);

    syncPointerCapability();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPointerCapability);
      return () => mediaQuery.removeEventListener('change', syncPointerCapability);
    }

    mediaQuery.addListener(syncPointerCapability);
    return () => mediaQuery.removeListener(syncPointerCapability);
  }, []);

  const isEnabled = !disabled && (enabled ?? hasCoarsePointer);

  useEffect(() => {
    optionsRef.current = {
      enabled: isEnabled,
      activationBand,
      minVisibleRatio,
      slope,
      hysteresis,
      disabled,
    };
  }, [activationBand, disabled, hysteresis, isEnabled, minVisibleRatio, slope]);

  const measureItems = useCallback(() => {
    const measurementReason = pendingMeasurementReasonRef.current;

    rafIdRef.current = null;
    pendingMeasurementReasonRef.current = 'layout';

    if (!canUseDOM() || !optionsRef.current.enabled) {
      setActiveId((prev) => (prev === null ? prev : null));
      return;
    }

    const items = Array.from(nodesRef.current.entries())
      .filter(([, node]) => node && typeof node.getBoundingClientRect === 'function')
      .map(([id, node]) => ({
        id,
        rect: node.getBoundingClientRect(),
      }));

    const nextActiveId = chooseViewportActiveItem(items, {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      currentActiveId: activeIdRef.current,
      activationBand: optionsRef.current.activationBand,
      minVisibleRatio: optionsRef.current.minVisibleRatio,
      slope: optionsRef.current.slope,
      hysteresis: optionsRef.current.hysteresis,
    });

    setActiveId((prev) => (Object.is(prev, nextActiveId) ? prev : nextActiveId));

    if (measurementReason === 'scroll') {
      setScrollMeasurementVersion((prev) => prev + 1);
    }
  }, []);

  const scheduleMeasurement = useCallback((reason = 'layout') => {
    if (!canUseDOM()) return;

    if (reason === 'scroll') {
      pendingMeasurementReasonRef.current = 'scroll';
    }

    if (rafIdRef.current !== null) return;

    rafIdRef.current = window.requestAnimationFrame(measureItems);
  }, [measureItems]);

  useEffect(() => {
    if (!isEnabled) {
      setActiveId((prev) => (prev === null ? prev : null));
      return undefined;
    }

    scheduleMeasurement();

    const onScroll = () => scheduleMeasurement('scroll');
    const onViewportLayoutChange = () => scheduleMeasurement('layout');

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onViewportLayoutChange);
    window.addEventListener('orientationchange', onViewportLayoutChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onViewportLayoutChange);
      window.removeEventListener('orientationchange', onViewportLayoutChange);
    };
  }, [isEnabled, scheduleMeasurement]);

  useEffect(() => () => {
    if (rafIdRef.current !== null && canUseDOM()) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const registerItem = useCallback((id) => {
    if (!refCallbacksRef.current.has(id)) {
      refCallbacksRef.current.set(id, (node) => {
        if (node) {
          nodesRef.current.set(id, node);
        } else {
          nodesRef.current.delete(id);
        }

        scheduleMeasurement();
      });
    }

    return refCallbacksRef.current.get(id);
  }, [scheduleMeasurement]);

  return {
    activeId,
    registerItem,
    scrollMeasurementVersion,
  };
}

export default useViewportActivationGroup;
