import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_ADMIN_ROUTE, resolveAdminRoute } from './adminRoutes.js';

function getFallbackRouteMatch() {
  return {
    route: DEFAULT_ADMIN_ROUTE,
    projectSubsectionId: null,
    canonicalPath: DEFAULT_ADMIN_ROUTE.path,
    shouldReplace: false,
    navigationAction: 'initial',
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
  const [routeMatch, setRouteMatch] = useState(() => ({
    ...readCurrentRoute(),
    navigationAction: 'initial',
  }));

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

    setRouteMatch({
      ...nextMatch,
      shouldReplace: false,
      navigationAction: historyMode,
    });
    return nextMatch;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncRoute = (navigationAction = 'popstate') => {
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
        navigationAction,
      });
    };

    syncRoute('initial');
    const handlePopstate = () => syncRoute('popstate');
    window.addEventListener('popstate', handlePopstate);

    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const pushAdminRoute = useCallback((pathOrRoute) => {
    return writeRoute(pathOrRoute, 'push');
  }, [writeRoute]);

  const replaceAdminRoute = useCallback((pathOrRoute) => {
    return writeRoute(pathOrRoute, 'replace');
  }, [writeRoute]);

  return {
    activeRoute: routeMatch.route,
    activeProjectSubsectionId: routeMatch.projectSubsectionId,
    canonicalPath: routeMatch.canonicalPath,
    pushAdminRoute,
    replaceAdminRoute,
    routeNavigationAction: routeMatch.navigationAction,
  };
}

export default useAdminRoute;
