import { describe, expect, it, vi } from 'vitest';

import { releasePreviewVideoElement } from '../../src/hooks/useHoverPreviewIntent.js';

function createVideoElementDouble({ currentSrc = '', src = 'video.mp4' } = {}) {
  let attrSrc = src;

  return {
    currentSrc,
    currentTime: 12,
    pause: vi.fn(),
    load: vi.fn(),
    getAttribute: vi.fn((name) => (name === 'src' ? attrSrc : null)),
    removeAttribute: vi.fn((name) => {
      if (name === 'src') attrSrc = null;
    }),
  };
}

describe('hover preview video release helper', () => {
  it('pauses, resets, and releases the source by default', () => {
    const videoEl = createVideoElementDouble();

    releasePreviewVideoElement(videoEl);

    expect(videoEl.pause).toHaveBeenCalledOnce();
    expect(videoEl.currentTime).toBe(0);
    expect(videoEl.removeAttribute).toHaveBeenCalledWith('src');
    expect(videoEl.load).toHaveBeenCalledOnce();
  });

  it('keeps a retained prefetched source attached after resetting playback', () => {
    const videoEl = createVideoElementDouble();

    releasePreviewVideoElement(videoEl, { retainVideoSource: true });

    expect(videoEl.pause).toHaveBeenCalledOnce();
    expect(videoEl.currentTime).toBe(0);
    expect(videoEl.removeAttribute).not.toHaveBeenCalled();
    expect(videoEl.load).not.toHaveBeenCalled();
  });

  it('does not touch an element with no attached source', () => {
    const videoEl = createVideoElementDouble({ currentSrc: '', src: null });

    releasePreviewVideoElement(videoEl);

    expect(videoEl.pause).not.toHaveBeenCalled();
    expect(videoEl.removeAttribute).not.toHaveBeenCalled();
    expect(videoEl.load).not.toHaveBeenCalled();
  });
});
