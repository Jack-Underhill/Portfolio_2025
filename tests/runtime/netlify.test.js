import { afterEach, describe, expect, it, vi } from 'vitest';

import { canUseNetlifyFunctions } from '../../src/runtime/netlify.js';

describe('Netlify runtime helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('disables Netlify-backed media during plain Vite development', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', undefined);

    expect(canUseNetlifyFunctions()).toBe(false);
  });

  it('enables Netlify-backed media when Netlify Dev opts in', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', 'true');

    expect(canUseNetlifyFunctions()).toBe(true);
  });

  it('enables Netlify-backed media in production builds', () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', undefined);

    expect(canUseNetlifyFunctions()).toBe(true);
  });
});
