import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_ADMIN_ROUTE, resolveAdminRoute } from './adminRoutes.js';

function readCurrentRoute() {
  if (typeof window === 'undefined') {
    return {
      route: DEFAULT_ADMIN_ROUTE,
      canonicalPath: DEFAULT_ADMIN_ROUTE.path,
      shouldReplace: false,
    };
  }

  return resolveAdminRoute(window.location.pathname);
}

function buildAdminHistoryState(route) {
  const currentState = window.history.state;
  const state = currentState && typeof currentState === 'object'
    ? currentState
    : {};

  return {
    ...state,
    adminRouteId: route.id,
  };
}

export function useAdminRoute() {
  const [activeRoute, setActiveRoute] = useState(() => readCurrentRoute().route);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncRoute = () => {
      const match = readCurrentRoute();
      setActiveRoute(match.route);

      if (match.shouldReplace) {
        window.history.replaceState(
          buildAdminHistoryState(match.route),
          '',
          match.canonicalPath,
        );
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);

    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const navigateToRoute = useCallback((route) => {
    if (typeof window === 'undefined') return;
    if (!route || route.path === window.location.pathname) return;

    window.history.pushState(buildAdminHistoryState(route), '', route.path);
    setActiveRoute(route);
  }, []);

  const navigateToRouteId = useCallback((event, route) => {
    event?.preventDefault();
    navigateToRoute(route);
  }, [navigateToRoute]);

  return {
    activeRoute,
    navigateToRoute,
    navigateToRouteId,
  };
}

export default useAdminRoute;
