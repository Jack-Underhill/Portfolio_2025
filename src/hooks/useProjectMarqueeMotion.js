import { useCallback, useEffect, useRef, useState } from 'react';

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  FOCUS_ALIGN_DURATION_MS: 180,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
};

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getLoopAxis(direction) {
  const isVertical = direction === 'up' || direction === 'down';
  const sign = direction === 'left' || direction === 'up' ? 1 : -1;

  return { isVertical, sign };
}

function easeOutCubic(progress) {
  return 1 - ((1 - progress) ** 3);
}

function normalizeOffset(offset, sequenceSize) {
  if (sequenceSize <= 0) return 0;

  const nextOffset = offset % sequenceSize;
  return nextOffset < 0 ? nextOffset + sequenceSize : nextOffset;
}

export function getProjectMarqueeAlignmentDelta({
  containerRect,
  itemRect,
  isVertical = false,
  alignment = 'center',
}) {
  if (
    alignment !== 'center'
    || !containerRect
    || !itemRect
    || containerRect.width <= 0
    || containerRect.height <= 0
    || itemRect.width <= 0
    || itemRect.height <= 0
  ) {
    return null;
  }

  const containerCenter = isVertical
    ? containerRect.top + (containerRect.height / 2)
    : containerRect.left + (containerRect.width / 2);
  const itemCenter = isVertical
    ? itemRect.top + (itemRect.height / 2)
    : itemRect.left + (itemRect.width / 2);

  return itemCenter - containerCenter;
}

function useProjectMarqueeMotion({
  direction,
  speed,
  hoverSpeed,
  pauseOnHover,
  pauseOnFocus,
  isPaused,
  measurementKey,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);
  const rafRef = useRef(null);
  const alignmentRafRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { isVertical, sign } = getLoopAxis(direction);
  const effectiveHoverSpeed = pauseOnHover ? 0 : hoverSpeed;
  const interactionSpeed = isFocused && pauseOnFocus
    ? 0
    : isHovered && effectiveHoverSpeed !== undefined
      ? effectiveHoverSpeed
      : speed;
  const targetVelocity = interactionSpeed * sign;

  const applyTrackOffset = useCallback((nextOffset) => {
    const track = trackRef.current;
    if (!track) return;

    const offset = isVertical ? `0, ${-nextOffset}px, 0` : `${-nextOffset}px, 0, 0`;
    track.style.transform = `translate3d(${offset})`;
  }, [isVertical]);

  const updateMeasurements = useCallback(() => {
    if (!canUseDOM()) return;

    const container = containerRef.current;
    const sequence = seqRef.current;
    if (!container || !sequence) return;

    const containerRect = container.getBoundingClientRect();
    const sequenceRect = sequence.getBoundingClientRect();
    const nextSeqWidth = sequenceRect.width;
    const nextSeqHeight = sequenceRect.height;
    const containerSize = isVertical ? containerRect.height : containerRect.width;
    const sequenceSize = isVertical ? nextSeqHeight : nextSeqWidth;

    if (sequenceSize > 0) {
      const minCopies = Math.ceil(containerSize / sequenceSize) + ANIMATION_CONFIG.COPY_HEADROOM;
      const nextCopyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, minCopies);
      setCopyCount((prev) => (prev === nextCopyCount ? prev : nextCopyCount));
    }

    setSeqWidth((prev) => (prev === nextSeqWidth ? prev : nextSeqWidth));
    setSeqHeight((prev) => (prev === nextSeqHeight ? prev : nextSeqHeight));
  }, [isVertical]);

  useEffect(() => {
    if (!canUseDOM()) return undefined;

    if (typeof window.ResizeObserver !== 'function') {
      window.addEventListener('resize', updateMeasurements);
      updateMeasurements();
      return () => window.removeEventListener('resize', updateMeasurements);
    }

    const observers = [containerRef, seqRef].map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(updateMeasurements);
      observer.observe(ref.current);
      return observer;
    });

    updateMeasurements();
    return () => observers.forEach((observer) => observer?.disconnect());
  }, [updateMeasurements]);

  useEffect(() => {
    if (!canUseDOM()) return undefined;

    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) {
      updateMeasurements();
      return undefined;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) updateMeasurements();
    };

    images.forEach((image) => {
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener('load', handleImageLoad, { once: true });
        image.addEventListener('error', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener('load', handleImageLoad);
        image.removeEventListener('error', handleImageLoad);
      });
    };
  }, [measurementKey, updateMeasurements]);

  useEffect(() => {
    if (!canUseDOM()) return undefined;

    const track = trackRef.current;
    const sequenceSize = isVertical ? seqHeight : seqWidth;
    if (!track || sequenceSize <= 0) return undefined;

    if (isPaused) {
      velocityRef.current = 0;
      lastTimestampRef.current = null;
      return undefined;
    }

    const animate = (timestamp) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaSeconds = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const smoothing = 1 - Math.exp(-deltaSeconds / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (targetVelocity - velocityRef.current) * smoothing;

      const delta = velocityRef.current * deltaSeconds;
      offsetRef.current = normalizeOffset(offsetRef.current + delta, sequenceSize);
      applyTrackOffset(offsetRef.current);
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [applyTrackOffset, isPaused, isVertical, seqHeight, seqWidth, targetVelocity]);

  const alignItemToViewport = useCallback((itemElement, { alignment = 'center' } = {}) => {
    if (!canUseDOM() || alignment !== 'center') return;

    const container = containerRef.current;
    const sequenceSize = isVertical ? seqHeight : seqWidth;
    if (!container || !itemElement || sequenceSize <= 0) return;

    const alignmentDelta = getProjectMarqueeAlignmentDelta({
      containerRect: container.getBoundingClientRect(),
      itemRect: itemElement.getBoundingClientRect(),
      isVertical,
      alignment,
    });
    if (alignmentDelta === null) return;

    if (alignmentRafRef.current !== null) {
      window.cancelAnimationFrame(alignmentRafRef.current);
      alignmentRafRef.current = null;
    }

    const startOffset = offsetRef.current;
    const targetOffset = startOffset + alignmentDelta;
    const startedAt = window.performance.now();

    velocityRef.current = 0;
    lastTimestampRef.current = null;

    const animateAlignment = (timestamp) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(1, elapsed / ANIMATION_CONFIG.FOCUS_ALIGN_DURATION_MS);
      const easedProgress = easeOutCubic(progress);
      const nextOffset = normalizeOffset(
        startOffset + ((targetOffset - startOffset) * easedProgress),
        sequenceSize,
      );

      offsetRef.current = nextOffset;
      applyTrackOffset(nextOffset);

      if (progress < 1) {
        alignmentRafRef.current = window.requestAnimationFrame(animateAlignment);
        return;
      }

      offsetRef.current = normalizeOffset(targetOffset, sequenceSize);
      applyTrackOffset(offsetRef.current);
      velocityRef.current = 0;
      lastTimestampRef.current = null;
      alignmentRafRef.current = null;
    };

    alignmentRafRef.current = window.requestAnimationFrame(animateAlignment);
  }, [applyTrackOffset, isVertical, seqHeight, seqWidth]);

  useEffect(() => () => {
    if (!canUseDOM()) return;
    if (alignmentRafRef.current !== null) {
      window.cancelAnimationFrame(alignmentRafRef.current);
      alignmentRafRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  const handleFocusCapture = useCallback(() => {
    if (pauseOnFocus) setIsFocused(true);
  }, [pauseOnFocus]);

  const handleBlurCapture = useCallback((event) => {
    if (!pauseOnFocus) return;

    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement && event.currentTarget.contains(nextFocusedElement)) return;

    setIsFocused(false);
  }, [pauseOnFocus]);

  return {
    containerRef,
    trackRef,
    seqRef,
    copyCount,
    isVertical,
    handleMouseEnter,
    handleMouseLeave,
    handleFocusCapture,
    handleBlurCapture,
    alignItemToViewport,
  };
}

export default useProjectMarqueeMotion;
