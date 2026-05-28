import { useCallback, useEffect, useRef, useState } from 'react';

import usePrefersReducedMotion from './usePrefersReducedMotion';

function useHoverPreviewIntent({
  id,
  safeVideo,
  isActivePreview = false,
  isModalOpen = false,
  requestPreview,
  clearPreview,
  hoverIntentMs = 250,
  retainVideoSource = false,
} = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const disablePreviewLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = null;

    setIsPreviewed((prev) => (prev ? false : prev));
    setIsLoadingVideo((prev) => (prev ? false : prev));

    const videoEl = videoRef.current;
    if (!videoEl || (!videoEl.currentSrc && !videoEl.getAttribute('src'))) return;

    videoEl.pause();
    videoEl.currentTime = 0;
    if (retainVideoSource) return;

    videoEl.removeAttribute('src');
    videoEl.load();
  }, [retainVideoSource]);

  useEffect(() => {
    if (!isActivePreview || typeof window === 'undefined') return undefined;
    if (prefersReducedMotion) return undefined;

    setIsPreviewed(true);

    // Hover intent: do not attach the video src until the card stays active.
    hoverTimerRef.current = window.setTimeout(() => {
      setIsLoadingVideo(true);
    }, hoverIntentMs);

    return () => {
      disablePreviewLocal();
    };
  }, [disablePreviewLocal, hoverIntentMs, isActivePreview, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      disablePreviewLocal();
      clearPreview?.(id);
    }
  }, [clearPreview, disablePreviewLocal, id, prefersReducedMotion]);

  useEffect(() => {
    if (!isPreviewed || !isLoadingVideo) return undefined;

    const videoEl = videoRef.current;
    if (!videoEl) return undefined;

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled) return;

      try {
        await videoEl.play();
      } catch {
        // Browser autoplay decisions can race with focus/hover transitions.
      }
    };

    if (videoEl.readyState >= 2) {
      tryPlay();
      return () => {
        cancelled = true;
      };
    }

    const onCanPlay = () => tryPlay();
    videoEl.addEventListener('canplay', onCanPlay, { once: true });

    return () => {
      cancelled = true;
      videoEl.removeEventListener('canplay', onCanPlay);
    };
  }, [isLoadingVideo, isPreviewed]);

  const enablePreview = useCallback(() => {
    if (safeVideo && !isModalOpen && !prefersReducedMotion) {
      requestPreview?.(id, 'interaction');
    }
  }, [id, isModalOpen, prefersReducedMotion, requestPreview, safeVideo]);

  const disablePreviewAndRelease = useCallback(() => {
    disablePreviewLocal();
    clearPreview?.(id, 'interaction');
  }, [clearPreview, disablePreviewLocal, id]);

  return {
    videoRef,
    isPreviewed,
    isLoadingVideo,
    enablePreview,
    disablePreviewAndRelease,
    disablePreviewLocal,
  };
}

export default useHoverPreviewIntent;
