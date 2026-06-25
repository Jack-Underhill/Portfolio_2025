export const NAVIGATION_RELEASE_ACTIONS = Object.freeze({
  NONE: 'none',
  NOTIFY_SETTLED: 'notify-settled',
  REPLACE_OBSERVED_ROUTE: 'replace-observed-route',
});

export function getObservedLeafTransition({
  hasNavigationTarget = false,
  isStabilizing = false,
  leafId = null,
} = {}) {
  if (!leafId || isStabilizing) {
    return {
      shouldReplaceRoute: false,
      shouldUpdateObservedLeaf: false,
    };
  }

  return {
    shouldReplaceRoute: !hasNavigationTarget,
    shouldUpdateObservedLeaf: true,
  };
}

export function getNavigationReleaseAction({
  hasNavigationTarget = false,
  observedLeafId = null,
  reason = 'settled',
} = {}) {
  if (!hasNavigationTarget) {
    return NAVIGATION_RELEASE_ACTIONS.NONE;
  }

  if (reason === 'interrupted' && observedLeafId) {
    return NAVIGATION_RELEASE_ACTIONS.REPLACE_OBSERVED_ROUTE;
  }

  if (reason === 'settled') {
    return NAVIGATION_RELEASE_ACTIONS.NOTIFY_SETTLED;
  }

  return NAVIGATION_RELEASE_ACTIONS.NONE;
}
