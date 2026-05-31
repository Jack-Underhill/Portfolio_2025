const PROJECT_VIDEO_DEBUG_PARAM = 'projectVideoDebug';
const PROJECT_VIDEO_DEBUG_ENDPOINT = '/__project-video-debug';

export const PROJECT_VIDEO_DEBUG_EVENTS = [
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

let projectVideoDebugSequence = 0;

export function isProjectVideoDebugEnabled() {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;

  return new URLSearchParams(window.location.search).get(PROJECT_VIDEO_DEBUG_PARAM) === '1';
}

function getBooleanAttribute(videoEl, name) {
  return Boolean(videoEl?.hasAttribute?.(name));
}

function getRoundedNumber(value, digits = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function getVideoRectSnapshot(videoEl) {
  if (!videoEl?.getBoundingClientRect) return null;

  const rect = videoEl.getBoundingClientRect();

  return {
    width: getRoundedNumber(rect.width),
    height: getRoundedNumber(rect.height),
    top: getRoundedNumber(rect.top),
    left: getRoundedNumber(rect.left),
    visible:
      rect.width > 0
      && rect.height > 0
      && rect.bottom > 0
      && rect.right > 0
      && rect.top < window.innerHeight
      && rect.left < window.innerWidth,
  };
}

function getVideoStyleSnapshot(videoEl) {
  if (!videoEl || typeof window === 'undefined' || !window.getComputedStyle) return null;

  const styles = window.getComputedStyle(videoEl);

  return {
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
  };
}

function getUserActivationSnapshot() {
  if (typeof navigator === 'undefined' || !navigator.userActivation) return null;

  return {
    isActive: navigator.userActivation.isActive,
    hasBeenActive: navigator.userActivation.hasBeenActive,
  };
}

function getVideoDebugSnapshot(videoEl) {
  const hasSrcAttribute = Boolean(videoEl?.getAttribute?.('src'));
  const mediaError = videoEl?.error;

  return {
    readyState: videoEl?.readyState,
    networkState: videoEl?.networkState,
    paused: videoEl?.paused,
    currentTime: getRoundedNumber(videoEl?.currentTime),
    src: videoEl?.currentSrc || (hasSrcAttribute ? 'attribute' : 'none'),
    muted: videoEl?.muted,
    defaultMuted: videoEl?.defaultMuted,
    mutedAttr: getBooleanAttribute(videoEl, 'muted'),
    autoplay: videoEl?.autoplay,
    autoplayAttr: getBooleanAttribute(videoEl, 'autoplay'),
    playsInline: videoEl?.playsInline,
    playsInlineAttr: getBooleanAttribute(videoEl, 'playsinline'),
    webkitPlaysInlineAttr: getBooleanAttribute(videoEl, 'webkit-playsinline'),
    controls: videoEl?.controls,
    volume: getRoundedNumber(videoEl?.volume),
    videoWidth: videoEl?.videoWidth,
    videoHeight: videoEl?.videoHeight,
    audioTracks: videoEl?.audioTracks?.length ?? null,
    errorCode: mediaError?.code ?? null,
    errorMessage: mediaError?.message ?? null,
    documentVisibility: typeof document === 'undefined' ? null : document.visibilityState,
    userActivation: getUserActivationSnapshot(),
    rect: getVideoRectSnapshot(videoEl),
    style: getVideoStyleSnapshot(videoEl),
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

export function writeProjectVideoDebug({ id, phase, videoEl, detail = null, error = null }) {
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
    `muted=${snapshot.muted ?? 'n/a'}`,
    `defMuted=${snapshot.defaultMuted ?? 'n/a'}`,
    `mutedAttr=${snapshot.mutedAttr}`,
    `autoplay=${snapshot.autoplay ?? 'n/a'}`,
    `autoplayAttr=${snapshot.autoplayAttr}`,
    `playsInline=${snapshot.playsInline ?? 'n/a'}`,
    `playsInlineAttr=${snapshot.playsInlineAttr}`,
    `webkitInlineAttr=${snapshot.webkitPlaysInlineAttr}`,
    `controls=${snapshot.controls ?? 'n/a'}`,
    `volume=${snapshot.volume ?? 'n/a'}`,
    `audioTracks=${snapshot.audioTracks ?? 'n/a'}`,
    `docVis=${snapshot.documentVisibility ?? 'n/a'}`,
    `uaActive=${snapshot.userActivation?.isActive ?? 'n/a'}`,
    `uaEver=${snapshot.userActivation?.hasBeenActive ?? 'n/a'}`,
    `rect=${snapshot.rect ? `${snapshot.rect.width}x${snapshot.rect.height}@${snapshot.rect.left},${snapshot.rect.top}` : 'n/a'}`,
    `rectVis=${snapshot.rect?.visible ?? 'n/a'}`,
    `css=${snapshot.style ? `${snapshot.style.display}/${snapshot.style.visibility}/${snapshot.style.opacity}` : 'n/a'}`,
    `video=${snapshot.videoWidth ?? 'n/a'}x${snapshot.videoHeight ?? 'n/a'}`,
    `mediaError=${snapshot.errorCode ?? 'none'}`,
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
