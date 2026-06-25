import { describe, expect, it } from 'vitest';

import {
  getActiveScrollSection,
  getObservedScrollLocationRects,
  getScrollTargetKey,
  isScrollSectionAcceptablyVisible,
} from '../../src/admin/routing/scrollspyUtils.js';
import {
  ADMIN_OBSERVED_LEAVES,
  ADMIN_SCROLL_TARGET_TYPES,
} from '../../src/admin/routing/adminRoutes.js';

const DEFAULT_VIEWPORT = {
  scrollTop: 400,
  scrollBottom: 1300,
  scrollHeight: 3000,
  viewportTop: 0,
  viewportHeight: 900,
};

describe('admin scrollspy utilities', () => {
  it('creates stable keys for typed scroll targets', () => {
    expect(getScrollTargetKey({
      type: ADMIN_SCROLL_TARGET_TYPES.ROOT_SECTION,
      id: 'projects',
    })).toBe('root-section:projects');
    expect(getScrollTargetKey(null)).toBeNull();
  });

  it('builds ordered observation geometry from the flattened leaf metadata', () => {
    const observationTargets = ADMIN_OBSERVED_LEAVES.map((leaf) => leaf.observationTarget);
    const uniqueTargetKeys = [...new Set(observationTargets.map(getScrollTargetKey))];
    const classificationRect = { top: 240, bottom: 520 };
    const elementsByTarget = new Map(uniqueTargetKeys.map((targetKey, index) => [
      targetKey,
      {
        getBoundingClientRect: () => ({
          top: index * 100,
          bottom: (index + 1) * 100,
        }),
      },
    ]));
    elementsByTarget.set('project-subsection:classification', {
      getBoundingClientRect: () => classificationRect,
    });
    elementsByTarget.set('root-section:projects', {
      getBoundingClientRect: () => ({ top: 100, bottom: 800 }),
    });
    elementsByTarget.set('project-subsection:intro', {
      getBoundingClientRect: () => ({ top: 200, bottom: 300 }),
    });

    const rects = getObservedScrollLocationRects(
      ADMIN_OBSERVED_LEAVES,
      (target) => elementsByTarget.get(getScrollTargetKey(target)) || null,
    );

    expect(rects.map(({ id }) => id)).toEqual(
      ADMIN_OBSERVED_LEAVES.map(({ id }) => id),
    );
    expect(rects.slice(0, 3)).toEqual([
      { id: 'about', rect: { top: 0, bottom: 100 } },
      { id: 'projects/classification', rect: { top: 100, bottom: 200 } },
      { id: 'projects/intro', rect: { top: 200, bottom: 300 } },
    ]);
    expect(rects[1].rect.top).not.toBe(classificationRect.top);
    expect(rects.at(-1)).toEqual({
      id: 'contact',
      rect: { top: 1100, bottom: 1200 },
    });
  });

  it('ends the final Projects leaf at the Education observation boundary', () => {
    const challengesIndex = ADMIN_OBSERVED_LEAVES.findIndex(
      ({ id }) => id === 'projects/challenges',
    );
    const educationIndex = ADMIN_OBSERVED_LEAVES.findIndex(
      ({ id }) => id === 'education',
    );
    const elementsByTarget = new Map([
      ['project-subsection:challenges', {
        getBoundingClientRect: () => ({ top: 300, bottom: 900 }),
      }],
      ['root-section:education', {
        getBoundingClientRect: () => ({ top: 740, bottom: 1200 }),
      }],
    ]);

    const rects = getObservedScrollLocationRects(
      [
        ADMIN_OBSERVED_LEAVES[challengesIndex],
        ADMIN_OBSERVED_LEAVES[educationIndex],
      ],
      (target) => elementsByTarget.get(getScrollTargetKey(target)) || null,
    );

    expect(rects).toEqual([
      {
        id: 'projects/challenges',
        rect: { top: 300, bottom: 740 },
      },
      {
        id: 'education',
        rect: { top: 740, bottom: 1200 },
      },
    ]);
  });

  it('skips unavailable targets without changing the remaining location order', () => {
    const elementsByTarget = new Map([
      ['root-section:about', {
        getBoundingClientRect: () => ({ top: -500, bottom: 80 }),
      }],
      ['project-subsection:intro', {
        getBoundingClientRect: () => ({ top: 540, bottom: 900 }),
      }],
    ]);

    const rects = getObservedScrollLocationRects(
      ADMIN_OBSERVED_LEAVES.slice(0, 3),
      (target) => elementsByTarget.get(getScrollTargetKey(target)) || null,
    );

    expect(rects).toEqual([
      { id: 'about', rect: { top: -500, bottom: 540 } },
      { id: 'projects/intro', rect: { top: 540, bottom: 900 } },
    ]);
  });

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

  it('treats a sticky-offset section as visible when it covers the active reading line', () => {
    expect(isScrollSectionAcceptablyVisible(
      { top: 120, bottom: 640 },
      { viewportTop: 208, viewportHeight: 900 },
    )).toBe(true);
  });

  it('treats a section starting near the sticky top as already aligned', () => {
    expect(isScrollSectionAcceptablyVisible(
      { top: 224, bottom: 520 },
      { viewportTop: 208, viewportHeight: 900 },
    )).toBe(true);
  });

  it('requires scrolling when the section is clipped above the sticky controls', () => {
    expect(isScrollSectionAcceptablyVisible(
      { top: -120, bottom: 220 },
      { viewportTop: 208, viewportHeight: 900 },
    )).toBe(false);
  });

  it('requires scrolling when the section is below the current viewport', () => {
    expect(isScrollSectionAcceptablyVisible(
      { top: 1200, bottom: 1500 },
      { viewportTop: 208, viewportHeight: 900 },
    )).toBe(false);
  });
});
