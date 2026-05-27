import { describe, expect, it } from 'vitest';

import { getProjectMarqueeAlignmentDelta } from '../../src/hooks/useProjectMarqueeMotion.js';

function rect({ left = 0, top = 0, width = 100, height = 100 } = {}) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

describe('project marquee motion helpers', () => {
  it('returns no delta when the item is already centered horizontally', () => {
    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect({ left: 100, width: 400 }),
      itemRect: rect({ left: 250, width: 100 }),
    })).toBe(0);
  });

  it('returns a negative delta for an item left of the horizontal center', () => {
    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect({ left: 100, width: 400 }),
      itemRect: rect({ left: 100, width: 100 }),
    })).toBe(-150);
  });

  it('returns a positive delta for an item right of the horizontal center', () => {
    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect({ left: 100, width: 400 }),
      itemRect: rect({ left: 400, width: 100 }),
    })).toBe(150);
  });

  it('uses vertical centers when the marquee direction is vertical', () => {
    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect({ top: 200, height: 300 }),
      itemRect: rect({ top: 275, height: 150 }),
      isVertical: true,
    })).toBe(0);
  });

  it('guards unsupported alignment and empty measurements', () => {
    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect({ width: 0 }),
      itemRect: rect(),
    })).toBeNull();

    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect(),
      itemRect: rect({ height: 0 }),
    })).toBeNull();

    expect(getProjectMarqueeAlignmentDelta({
      containerRect: rect(),
      itemRect: rect(),
      alignment: 'start',
    })).toBeNull();
  });
});
