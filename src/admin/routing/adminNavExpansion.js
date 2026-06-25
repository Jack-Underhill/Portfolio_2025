import { ADMIN_OBSERVED_LEAVES, ADMIN_ROUTES } from './adminRoutes.js';

const EXPANDABLE_ROUTE_IDS = new Set(
  ADMIN_ROUTES
    .filter((route) => route.children?.length > 0)
    .map((route) => route.id),
);

const ROUTE_ID_BY_LOCATION_ID = new Map([
  ...ADMIN_ROUTES.map((route) => [route.id, route.id]),
  ...ADMIN_OBSERVED_LEAVES.map((leaf) => [leaf.id, leaf.routeId]),
]);

function getExpandableRouteId(locationId) {
  const routeId = ROUTE_ID_BY_LOCATION_ID.get(locationId);
  return EXPANDABLE_ROUTE_IDS.has(routeId) ? routeId : null;
}

export function getExpandedAdminRouteIds({
  observedLeafId,
  navigationTarget = null,
}) {
  const observedRouteId = getExpandableRouteId(observedLeafId);

  if (!navigationTarget) {
    return observedRouteId ? [observedRouteId] : [];
  }

  const destinationRouteId = getExpandableRouteId(navigationTarget.destinationId);
  if (destinationRouteId) {
    return [destinationRouteId];
  }

  const originRouteId = getExpandableRouteId(navigationTarget.originLeafId);
  if (originRouteId && observedRouteId === originRouteId) {
    return [originRouteId];
  }

  return [];
}
