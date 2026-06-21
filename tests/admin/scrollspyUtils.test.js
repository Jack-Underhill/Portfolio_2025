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
  it('returns no active section when no section rects are available', () => {
    expect(getActiveScrollSection([], DEFAULT_VIEWPORT)).toBeNull();
  });

  it('forces the first section at the top of the scroll range', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'about', rect: { top: -12, bottom: 80 } },
      { id: 'projects', rect: { top: 96, bottom: 980 } },
    ], {
      ...DEFAULT_VIEWPORT,
      scrollTop: 0,
      scrollBottom: 900,
    });

    expect(activeSectionId).toBe('about');
  });

  it('forces the final section near the bottom of the scroll range', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'skills', rect: { top: -200, bottom: 200 } },
      { id: 'contact', rect: { top: 240, bottom: 720 } },
    ], {
      ...DEFAULT_VIEWPORT,
      scrollTop: 2104,
      scrollBottom: 3000,
      scrollHeight: 3000,
    });

    expect(activeSectionId).toBe('contact');
  });

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
      { id: 'tech', rect: { top: 132, bottom: 420 } },
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

  it('uses a viewport top offset when sticky controls cover the visual top edge', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'classification', rect: { top: -480, bottom: 180 } },
      { id: 'intro', rect: { top: 208, bottom: 720 } },
      { id: 'media', rect: { top: 760, bottom: 1200 } },
    ], {
      ...DEFAULT_VIEWPORT,
      currentSectionId: 'classification',
      viewportTop: 208,
    });

    expect(activeSectionId).toBe('intro');
  });

  it('uses largest visible area when no section owns the activation band', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'intro', rect: { top: 520, bottom: 760 } },
      { id: 'media', rect: { top: 560, bottom: 900 } },
    ], DEFAULT_VIEWPORT);

    expect(activeSectionId).toBe('media');
  });

  it('keeps the current section when its visible area is close to the largest visible section', () => {
    const activeSectionId = getActiveScrollSection([
      { id: 'intro', rect: { top: 520, bottom: 820 } },
      { id: 'media', rect: { top: 560, bottom: 900 } },
    ], {
      ...DEFAULT_VIEWPORT,
      currentSectionId: 'intro',
    });

    expect(activeSectionId).toBe('intro');
  });
});
