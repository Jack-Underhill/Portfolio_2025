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
