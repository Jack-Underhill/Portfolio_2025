import { describe, expect, it, vi } from 'vitest';

import {
  bindPreviewVideoPlaybackState,
  releasePreviewVideoElement,
} from '../../src/hooks/useHoverPreviewIntent.js';

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

function createEventTargetDouble() {
  const listeners = new Map();

  return {
    addEventListener: vi.fn((eventName, listener) => {
      const eventListeners = listeners.get(eventName) ?? new Set();
      eventListeners.add(listener);
      listeners.set(eventName, eventListeners);
    }),
    removeEventListener: vi.fn((eventName, listener) => {
      listeners.get(eventName)?.delete(listener);
    }),
    dispatch(eventName) {
      listeners.get(eventName)?.forEach((listener) => listener({ type: eventName }));
    },
    listenerCount(eventName) {
      return listeners.get(eventName)?.size ?? 0;
    },
  };
}

function createPlaybackStateSetter(initialState = false) {
  let state = initialState;
  const setState = vi.fn((nextState) => {
    state = typeof nextState === 'function' ? nextState(state) : nextState;
  });

  return {
    get state() {
      return state;
    },
    setState,
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

describe('hover preview playback state helper', () => {
  it('marks actual playback from the playing event', () => {
    const videoEl = createEventTargetDouble();
    const playback = createPlaybackStateSetter();

    bindPreviewVideoPlaybackState(videoEl, playback.setState);
    videoEl.dispatch('playing');

    expect(playback.state).toBe(true);
    expect(playback.setState).toHaveBeenCalledWith(true);
  });

  it.each(['pause', 'emptied', 'ended', 'error'])(
    'clears actual playback state on %s',
    (eventName) => {
      const videoEl = createEventTargetDouble();
      const playback = createPlaybackStateSetter(true);

      bindPreviewVideoPlaybackState(videoEl, playback.setState);
      videoEl.dispatch(eventName);

      expect(playback.state).toBe(false);
      expect(playback.setState).toHaveBeenCalledWith(expect.any(Function));
    },
  );

  it('removes playback listeners during cleanup', () => {
    const videoEl = createEventTargetDouble();
    const playback = createPlaybackStateSetter();

    const cleanup = bindPreviewVideoPlaybackState(videoEl, playback.setState);
    cleanup();

    videoEl.dispatch('playing');
    expect(playback.state).toBe(false);
    expect(videoEl.listenerCount('playing')).toBe(0);
    expect(videoEl.listenerCount('pause')).toBe(0);
  });
});
