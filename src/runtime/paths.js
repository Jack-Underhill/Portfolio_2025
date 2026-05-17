export const PUBLIC_ROUTES = Object.freeze({
  HOME: '/',
  ADMIN_BASE: '/admin',
  PROJECT_BASE: '/p',
  ARCHITECTURE_VIEWER: '/architecture-viewer',
});

export const NETLIFY_FUNCTION_BASE_PATH = '/.netlify/functions';

export const NETLIFY_FUNCTION_PATHS = Object.freeze({
  TRACK_VISIT: `${NETLIFY_FUNCTION_BASE_PATH}/track-visit`,
  INLINE_SVG: `${NETLIFY_FUNCTION_BASE_PATH}/inline-svg`,
});
