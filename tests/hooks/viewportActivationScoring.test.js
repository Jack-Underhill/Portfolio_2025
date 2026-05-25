import { describe, expect, it } from 'vitest';

import {
  chooseViewportActiveItem,
  getActivationLineYAtX,
  getVisibleRatio,
  scoreRectAgainstActivationLine,
} from '../../src/hooks/useViewportActivationGroup.js';

const VIEWPORT = {
  viewportWidth: 1000,
  viewportHeight: 1000,
};

function rectFromCenter(centerX, centerY, width = 100, height = 100) {
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
    width,
    height,
  };
}

describe('viewport activation scoring helpers', () => {
  it('computes a diagonal activation line from the viewport center', () => {
    expect(getActivationLineYAtX(250, {
      viewportCenterX: 500,
      viewportCenterY: 500,
      slope: -0.35,
    })).toBeCloseTo(587.5);
  });

  it('computes visible ratio for partially clipped cards', () => {
    expect(getVisibleRatio(rectFromCenter(500, 980, 100, 100), 1000, 1000)).toBeCloseTo(0.7);
  });

  it('scores a rect by distance from its center to the diagonal line', () => {
    const score = scoreRectAgainstActivationLine(rectFromCenter(250, 600), {
      ...VIEWPORT,
      slope: -0.35,
    });

    expect(score.lineY).toBeCloseTo(587.5);
    expect(score.distance).toBeCloseTo(12.5);
    expect(score.visibleRatio).toBe(1);
  });

  it('chooses the visible card closest to the diagonal activation line', () => {
    const activeId = chooseViewportActiveItem([
      { id: 'far', rect: rectFromCenter(500, 720) },
      { id: 'near', rect: rectFromCenter(250, 590) },
    ], {
      ...VIEWPORT,
      slope: -0.35,
      activationBand: 350,
    });

    expect(activeId).toBe('near');
  });

  it('ignores candidates below the minimum visible ratio', () => {
    const activeId = chooseViewportActiveItem([
      { id: 'mostly-hidden', rect: rectFromCenter(500, 1045) },
      { id: 'visible', rect: rectFromCenter(500, 620) },
    ], {
      ...VIEWPORT,
      minVisibleRatio: 0.2,
      activationBand: 350,
    });

    expect(activeId).toBe('visible');
  });

  it('keeps the current active item when a new candidate only barely wins', () => {
    const activeId = chooseViewportActiveItem([
      { id: 'current', rect: rectFromCenter(500, 550) },
      { id: 'challenger', rect: rectFromCenter(500, 540) },
    ], {
      ...VIEWPORT,
      currentActiveId: 'current',
      hysteresis: 24,
      activationBand: 350,
    });

    expect(activeId).toBe('current');
  });

  it('prevents distant cards outside the activation band from becoming active', () => {
    const activeId = chooseViewportActiveItem([
      { id: 'distant', rect: rectFromCenter(500, 820) },
    ], {
      ...VIEWPORT,
      activationBand: 120,
    });

    expect(activeId).toBeNull();
  });

  it('behaves like center-screen activation for a single column', () => {
    const activeId = chooseViewportActiveItem([
      { id: 'above-center', rect: rectFromCenter(500, 360) },
      { id: 'near-center', rect: rectFromCenter(500, 510) },
      { id: 'below-center', rect: rectFromCenter(500, 680) },
    ], {
      ...VIEWPORT,
      activationBand: 350,
    });

    expect(activeId).toBe('near-center');
  });

  it('can select left and right grid cards based on diagonal position', () => {
    const leftActiveId = chooseViewportActiveItem([
      { id: 'left', rect: rectFromCenter(250, 585) },
      { id: 'center', rect: rectFromCenter(500, 650) },
      { id: 'right', rect: rectFromCenter(750, 650) },
    ], {
      ...VIEWPORT,
      slope: -0.35,
      activationBand: 350,
    });

    const rightActiveId = chooseViewportActiveItem([
      { id: 'left', rect: rectFromCenter(250, 300) },
      { id: 'center', rect: rectFromCenter(500, 300) },
      { id: 'right', rect: rectFromCenter(750, 415) },
    ], {
      ...VIEWPORT,
      slope: -0.35,
      activationBand: 350,
    });

    expect(leftActiveId).toBe('left');
    expect(rightActiveId).toBe('right');
  });
});
