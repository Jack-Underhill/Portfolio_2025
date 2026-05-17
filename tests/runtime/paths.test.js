import { describe, expect, it } from 'vitest';

import {
  NETLIFY_FUNCTION_BASE_PATH,
  NETLIFY_FUNCTION_PATHS,
  PUBLIC_ROUTES,
} from '../../src/runtime/paths.js';

describe('browser-visible path constants', () => {
  it('keeps public route constants literal and browser-safe', () => {
    expect(PUBLIC_ROUTES).toEqual({
      HOME: '/',
      ADMIN_BASE: '/admin',
      PROJECT_BASE: '/p',
      ARCHITECTURE_VIEWER: '/architecture-viewer',
    });
  });

  it('keeps browser-visible Netlify function paths in one place', () => {
    expect(NETLIFY_FUNCTION_BASE_PATH).toBe('/.netlify/functions');
    expect(NETLIFY_FUNCTION_PATHS).toEqual({
      TRACK_VISIT: '/.netlify/functions/track-visit',
      INLINE_SVG: '/.netlify/functions/inline-svg',
    });
  });
});
