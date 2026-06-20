import { describe, expect, it } from 'vitest';

import { getActiveScrollSection } from '../../src/admin/routing/scrollspyUtils.js';

const DEFAULT_VIEWPORT = {
  scrollTop: 400,
  scrollBottom: 1300,
  scrollHeight: 3000,
  viewportTop: 0,
  viewportHeight: 900,
};

describe('admin scrollspy utilities', () => {
  it('keeps a short section active when the activation line sits inside it', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'media', rect: { top: -380, bottom: 24 } },
      { id: 'links', rect: { top: 32, bottom: 132 } },
      { id: 'tech', rect: { top: 160, bottom: 420 } },
      { id: 'lists', rect: { top: 440, bottom: 1200 } },
    ], DEFAULT_VIEWPORT);

    expect(activeSectionId).toBe('links');
  });

  it('keeps a tiny section active while the activation line sits between it and the next section', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'media', rect: { top: -380, bottom: 24 } },
      { id: 'links', rect: { top: 32, bottom: 60 } },
      { id: 'tech', rect: { top: 90, bottom: 420 } },
      { id: 'lists', rect: { top: 440, bottom: 1200 } },
    ], DEFAULT_VIEWPORT);

    expect(activeSectionId).toBe('links');
  });

  it('moves to the following section after the activation line enters it', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'media', rect: { top: -520, bottom: -100 } },
      { id: 'links', rect: { top: -64, bottom: 24 } },
      { id: 'tech', rect: { top: 32, bottom: 360 } },
      { id: 'lists', rect: { top: 380, bottom: 1200 } },
    ], DEFAULT_VIEWPORT);

    expect(activeSectionId).toBe('tech');
  });
});
