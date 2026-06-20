import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_ADMIN_ROUTE, resolveAdminRoute } from './adminRoutes.js';

function getFallbackRouteMatch() {
  return {
    route: DEFAULT_ADMIN_ROUTE,
    projectSubsectionId: null,
    canonicalPath: DEFAULT_ADMIN_ROUTE.path,
    shouldReplace: false,
  };
}

function readCurrentRoute() {
  if (typeof window === 'undefined') {
    return getFallbackRouteMatch();
  }

  return resolveAdminRoute(window.location.pathname);
}

function buildAdminHistoryState(routeMatch) {
  const currentState = window.history.state;
  const state = currentState && typeof currentState === 'object'
    ? currentState
    : {};

  return {
    ...state,
    adminRouteId: routeMatch.route.id,
    adminProjectSubsectionId: routeMatch.projectSubsectionId,
  };
}

export function useAdminRoute() {
  const [routeMatch, setRouteMatch] = useState(readCurrentRoute);

  const writeRoute = useCallback((pathOrRoute, historyMode = 'push') => {
    if (typeof window === 'undefined') return getFallbackRouteMatch();

    const nextPath = typeof pathOrRoute === 'string'
      ? pathOrRoute
      : pathOrRoute?.path;

    if (!nextPath) return readCurrentRoute();

    const nextMatch = resolveAdminRoute(nextPath);
    const currentPath = window.location.pathname;
    const shouldWrite = nextMatch.canonicalPath !== currentPath
      || nextMatch.shouldReplace
      || historyMode === 'replace';

    if (shouldWrite) {
      const writer = historyMode === 'replace'
        ? window.history.replaceState
        : window.history.pushState;

      writer.call(
        window.history,
        buildAdminHistoryState(nextMatch),
        '',
        nextMatch.canonicalPath,
      );
    }

    setRouteMatch(nextMatch);
    return nextMatch;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncRoute = () => {
      const match = readCurrentRoute();

      if (match.shouldReplace) {
        window.history.replaceState(
          buildAdminHistoryState(match),
          '',
          match.canonicalPath,
        );
      }

      setRouteMatch({
        ...match,
        shouldReplace: false,
      });
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);

    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const pushAdminRoute = useCallback((pathOrRoute) => {
    writeRoute(pathOrRoute, 'push');
  }, [writeRoute]);

  const replaceAdminRoute = useCallback((pathOrRoute) => {
    writeRoute(pathOrRoute, 'replace');
  }, [writeRoute]);

  const navigateToRouteId = useCallback((event, route) => {
    event?.preventDefault();
    pushAdminRoute(route);
  }, [pushAdminRoute]);

  return {
    activeRoute: routeMatch.route,
    activeProjectSubsectionId: routeMatch.projectSubsectionId,
    canonicalPath: routeMatch.canonicalPath,
    navigateToRoute: pushAdminRoute,
    navigateToRouteId,
    pushAdminRoute,
    replaceAdminRoute,
  };
}

export default useAdminRoute;
