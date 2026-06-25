import { describe, expect, it } from 'vitest';

import {
  NAVIGATION_RELEASE_ACTIONS,
  getNavigationReleaseAction,
  getObservedLeafTransition,
} from '../../src/admin/routing/navigationCoordinatorPolicy.js';

describe('admin navigation coordinator policy', () => {
  it('updates traveling highlights without replacing the locked target route', () => {
    expect(getObservedLeafTransition({
      hasNavigationTarget: true,
      leafId: 'projects/media',
    })).toEqual({
      shouldReplaceRoute: false,
      shouldUpdateObservedLeaf: true,
    });
  });

  it('allows passive observation to replace the route while idle', () => {
    expect(getObservedLeafTransition({
      leafId: 'education',
    })).toEqual({
      shouldReplaceRoute: true,
      shouldUpdateObservedLeaf: true,
    });
  });

  it('blocks transient observation during project stabilization', () => {
    expect(getObservedLeafTransition({
      isStabilizing: true,
      leafId: 'education',
    })).toEqual({
      shouldReplaceRoute: false,
      shouldUpdateObservedLeaf: false,
    });
  });

  it('notifies target settlement without replacing the route', () => {
    expect(getNavigationReleaseAction({
      hasNavigationTarget: true,
      observedLeafId: 'projects/media',
      reason: 'settled',
    })).toBe(NAVIGATION_RELEASE_ACTIONS.NOTIFY_SETTLED);
  });

  it('replaces the target with the observed route after user interruption', () => {
    expect(getNavigationReleaseAction({
      hasNavigationTarget: true,
      observedLeafId: 'skills',
      reason: 'interrupted',
    })).toBe(NAVIGATION_RELEASE_ACTIONS.REPLACE_OBSERVED_ROUTE);
  });

  it('does not write a route when navigation ownership is already absent', () => {
    expect(getNavigationReleaseAction({
      observedLeafId: 'contact',
      reason: 'interrupted',
    })).toBe(NAVIGATION_RELEASE_ACTIONS.NONE);
  });
});
