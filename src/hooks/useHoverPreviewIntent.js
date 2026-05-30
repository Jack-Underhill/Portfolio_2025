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
let projectVideoDebugSequence = 0;

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

function writeProjectVideoDebug({ id, phase, videoEl, detail = null, error = null }) {
  if (!isProjectVideoDebugEnabled()) return;

  const snapshot = getVideoDebugSnapshot(videoEl);
  const sequence = ++projectVideoDebugSequence;
  const timestampMs =
    typeof performance !== 'undefined' ? Number(performance.now().toFixed(2)) : null;
  const errorText = error
    ? ` error=${error.name || 'Error'}:${error.message || ''}`
    : '';
  const detailText = detail ? ` detail=${detail}` : '';
  const line = [
    `[project-video] id=${id ?? 'unknown'}`,
    `seq=${sequence}`,
    `at=${timestampMs ?? 'n/a'}`,
    `phase=${phase}`,
    `rs=${snapshot.readyState ?? 'n/a'}`,
    `ns=${snapshot.networkState ?? 'n/a'}`,
    `paused=${snapshot.paused ?? 'n/a'}`,
    `t=${snapshot.currentTime ?? 'n/a'}`,
    `src=${snapshot.src}`,
  ].join(' ') + detailText + errorText;

  console.info(line, { id, sequence, timestampMs, phase, detail, ...snapshot, error });
  sendProjectVideoDebug({
    id,
    sequence,
    timestampMs,
    phase,
    detail,
    snapshot,
    error: errorText || null,
    line,
  });
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

    const markPlaying = () => {
      setIsVideoPlaying(true);
    };
    const markNotPlaying = () => {
      setIsVideoPlaying((prev) => (prev ? false : prev));
    };

    videoEl.addEventListener('playing', markPlaying);
    videoEl.addEventListener('pause', markNotPlaying);
    videoEl.addEventListener('emptied', markNotPlaying);
    videoEl.addEventListener('ended', markNotPlaying);
    videoEl.addEventListener('error', markNotPlaying);

    return () => {
      videoEl.removeEventListener('playing', markPlaying);
      videoEl.removeEventListener('pause', markNotPlaying);
      videoEl.removeEventListener('emptied', markNotPlaying);
      videoEl.removeEventListener('ended', markNotPlaying);
      videoEl.removeEventListener('error', markNotPlaying);
    };
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
