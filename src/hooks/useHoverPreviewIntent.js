import { useCallback, useEffect, useRef, useState } from 'react';

import usePrefersReducedMotion from './usePrefersReducedMotion';

const PROJECT_VIDEO_DEBUG_PARAM = 'projectVideoDebug';
const PROJECT_VIDEO_DEBUG_EVENTS = [
  'loadstart',
  'loadedmetadata',
  'loadeddata',
  'canplay',
  'playing',
  'pause',
  'waiting',
  'stalled',
  'suspend',
  'error',
  'emptied',
];
const PROJECT_VIDEO_DEBUG_ENDPOINT = '/__project-video-debug';

export function releasePreviewVideoElement(videoEl, { retainVideoSource = false } = {}) {
  if (!videoEl || (!videoEl.currentSrc && !videoEl.getAttribute('src'))) return;

  videoEl.pause();
  videoEl.currentTime = 0;
  if (retainVideoSource) return;

  videoEl.removeAttribute('src');
  videoEl.load();
}

function isProjectVideoDebugEnabled() {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;

  return new URLSearchParams(window.location.search).get(PROJECT_VIDEO_DEBUG_PARAM) === '1';
}

function getVideoDebugSnapshot(videoEl) {
  const hasSrcAttribute = Boolean(videoEl?.getAttribute?.('src'));

  return {
    readyState: videoEl?.readyState,
    networkState: videoEl?.networkState,
    paused: videoEl?.paused,
    currentTime: Number.isFinite(videoEl?.currentTime) ? Number(videoEl.currentTime.toFixed(2)) : null,
    src: videoEl?.currentSrc || (hasSrcAttribute ? 'attribute' : 'none'),
  };
}

function sendProjectVideoDebug(payload) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(PROJECT_VIDEO_DEBUG_ENDPOINT, blob);
    return;
  }

  fetch(PROJECT_VIDEO_DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function writeProjectVideoDebug({ id, phase, videoEl, error = null }) {
  if (!isProjectVideoDebugEnabled()) return;

  const snapshot = getVideoDebugSnapshot(videoEl);
  const errorText = error
    ? ` error=${error.name || 'Error'}:${error.message || ''}`
    : '';
  const line = [
    `[project-video] id=${id ?? 'unknown'}`,
    `phase=${phase}`,
    `rs=${snapshot.readyState ?? 'n/a'}`,
    `ns=${snapshot.networkState ?? 'n/a'}`,
    `paused=${snapshot.paused ?? 'n/a'}`,
    `t=${snapshot.currentTime ?? 'n/a'}`,
    `src=${snapshot.src}`,
  ].join(' ') + errorText;

  console.info(line, { id, phase, ...snapshot, error });
  sendProjectVideoDebug({ id, phase, snapshot, error: errorText || null, line });
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

    const tryPlay = async () => {
      if (cancelled) return;

      try {
        writeProjectVideoDebug({ id, phase: 'play-attempt', videoEl });
        await videoEl.play();
        writeProjectVideoDebug({ id, phase: 'play-resolved', videoEl });
      } catch (error) {
        writeProjectVideoDebug({ id, phase: 'play-rejected', videoEl, error });
        // Browser autoplay decisions can race with focus/hover transitions.
      }
    };

    if (videoEl.readyState >= 2) {
      tryPlay();
      return () => {
        cancelled = true;
      };
    }

    writeProjectVideoDebug({ id, phase: 'waiting-for-canplay', videoEl });

    const onCanPlay = () => tryPlay();
    videoEl.addEventListener('canplay', onCanPlay, { once: true });

    return () => {
      cancelled = true;
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
    enablePreview,
    disablePreviewAndRelease,
    disablePreviewLocal,
  };
}

export default useHoverPreviewIntent;
