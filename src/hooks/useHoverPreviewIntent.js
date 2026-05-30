import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PROJECT_VIDEO_DEBUG_EVENTS,
  isProjectVideoDebugEnabled,
  writeProjectVideoDebug,
} from '../logging/projectVideoDebug';
import usePrefersReducedMotion from './usePrefersReducedMotion';

export function releasePreviewVideoElement(videoEl, { retainVideoSource = false } = {}) {
  if (!videoEl || (!videoEl.currentSrc && !videoEl.getAttribute('src'))) return;

  videoEl.pause();
  videoEl.currentTime = 0;
  if (retainVideoSource) return;

  videoEl.removeAttribute('src');
  videoEl.load();
}

const PLAYBACK_STATE_EVENTS = ['pause', 'emptied', 'ended', 'error'];

export function bindPreviewVideoPlaybackState(videoEl, setIsVideoPlaying) {
  if (!videoEl) return () => {};

  const markPlaying = () => {
    setIsVideoPlaying(true);
  };
  const markNotPlaying = () => {
    setIsVideoPlaying((prev) => (prev ? false : prev));
  };

  videoEl.addEventListener('playing', markPlaying);
  PLAYBACK_STATE_EVENTS.forEach((eventName) => {
    videoEl.addEventListener(eventName, markNotPlaying);
  });

  return () => {
    videoEl.removeEventListener('playing', markPlaying);
    PLAYBACK_STATE_EVENTS.forEach((eventName) => {
      videoEl.removeEventListener(eventName, markNotPlaying);
    });
  };
}

function enforceInlineMutedPlayback(videoEl) {
  if (!videoEl) return;

  videoEl.muted = true;
  videoEl.defaultMuted = true;
  videoEl.playsInline = true;
  videoEl.setAttribute('muted', '');
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');
}

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const disablePreviewLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = null;

    setIsPreviewed((prev) => (prev ? false : prev));
    setIsLoadingVideo((prev) => (prev ? false : prev));
    setIsVideoPlaying((prev) => (prev ? false : prev));

    const videoEl = videoRef.current;
    releasePreviewVideoElement(videoEl, { retainVideoSource });
  }, [retainVideoSource]);

  useEffect(() => {
    if (!isActivePreview || typeof window === 'undefined') return undefined;
    if (prefersReducedMotion) return undefined;

    setIsPreviewed(true);
    writeProjectVideoDebug({ id, phase: 'activate-preview', videoEl: videoRef.current });

    // Hover intent: do not attach the video src until the card stays active.
    hoverTimerRef.current = window.setTimeout(() => {
      setIsLoadingVideo(true);
      writeProjectVideoDebug({ id, phase: 'hover-intent-elapsed', videoEl: videoRef.current });
    }, hoverIntentMs);

    return () => {
      disablePreviewLocal();
    };
  }, [disablePreviewLocal, hoverIntentMs, id, isActivePreview, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      disablePreviewLocal();
      clearPreview?.(id);
    }
  }, [clearPreview, disablePreviewLocal, id, prefersReducedMotion]);

  useEffect(() => {
    if (!safeVideo) return undefined;

    const videoEl = videoRef.current;
    if (!videoEl) return undefined;

    return bindPreviewVideoPlaybackState(videoEl, setIsVideoPlaying);
  }, [safeVideo]);

  useEffect(() => {
    if (!safeVideo || !isProjectVideoDebugEnabled()) return undefined;

    const videoEl = videoRef.current;
    if (!videoEl) return undefined;

    const onDebugEvent = (event) => {
      writeProjectVideoDebug({ id, phase: event.type, videoEl });
    };

    PROJECT_VIDEO_DEBUG_EVENTS.forEach((eventName) => {
      videoEl.addEventListener(eventName, onDebugEvent);
    });

    writeProjectVideoDebug({ id, phase: 'diagnostics-attached', videoEl });

    return () => {
      PROJECT_VIDEO_DEBUG_EVENTS.forEach((eventName) => {
        videoEl.removeEventListener(eventName, onDebugEvent);
      });
    };
  }, [id, safeVideo]);

  useEffect(() => {
    if (!isPreviewed || !isLoadingVideo) return undefined;

    const videoEl = videoRef.current;
    if (!videoEl) return undefined;

    let cancelled = false;
    let playPromise = null;

    const tryPlay = async (reason) => {
      if (cancelled || playPromise) return;

      try {
        enforceInlineMutedPlayback(videoEl);
        writeProjectVideoDebug({ id, phase: 'play-attempt', detail: reason, videoEl });
        playPromise = videoEl.play();
        await playPromise;
        writeProjectVideoDebug({ id, phase: 'play-resolved', detail: reason, videoEl });
      } catch (error) {
        writeProjectVideoDebug({ id, phase: 'play-rejected', detail: reason, videoEl, error });
        // Browser autoplay decisions can race with focus/hover transitions.
      } finally {
        playPromise = null;
      }
    };

    const onLoadedMetadata = () => tryPlay('loadedmetadata');
    const onLoadedData = () => tryPlay('loadeddata');
    const onCanPlay = () => tryPlay('canplay');

    if (videoEl.readyState >= 2) {
      tryPlay('ready-state');
      return () => {
        cancelled = true;
      };
    }

    tryPlay('immediate');

    videoEl.addEventListener('loadedmetadata', onLoadedMetadata);
    videoEl.addEventListener('loadeddata', onLoadedData);
    videoEl.addEventListener('canplay', onCanPlay);

    return () => {
      cancelled = true;
      videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoEl.removeEventListener('loadeddata', onLoadedData);
      videoEl.removeEventListener('canplay', onCanPlay);
    };
  }, [id, isLoadingVideo, isPreviewed]);

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
    isVideoPlaying,
    enablePreview,
    disablePreviewAndRelease,
    disablePreviewLocal,
  };
}

export default useHoverPreviewIntent;
