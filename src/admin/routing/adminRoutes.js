import { PUBLIC_ROUTES } from '../../runtime/paths.js';

export const ADMIN_ROUTE_IDS = Object.freeze({
  ABOUT: 'about',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  CERTIFICATIONS: 'certifications',
  SKILLS: 'skills',
  CONTACT: 'contact',
});

export const ADMIN_ROUTES = Object.freeze([
  Object.freeze({
    id: ADMIN_ROUTE_IDS.ABOUT,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/about`,
    label: 'About',
    icon: 'user',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.PROJECTS,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/projects`,
    label: 'Projects',
    icon: 'folder',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.EDUCATION,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/education`,
    label: 'Education',
    icon: 'graduation',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.CERTIFICATIONS,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/certifications`,
    label: 'Certifications',
    icon: 'badge',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.SKILLS,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/skills`,
    label: 'Skills',
    icon: 'spark',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.CONTACT,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/contact`,
    label: 'Contact',
    icon: 'mail',
  }),
]);

export const DEFAULT_ADMIN_ROUTE = ADMIN_ROUTES[0];

function trimTrailingSlash(pathname) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export function normalizeAdminPathname(pathname = '') {
  const cleanPathname = trimTrailingSlash(pathname || PUBLIC_ROUTES.ADMIN_BASE);

  if (cleanPathname === PUBLIC_ROUTES.ADMIN_BASE) {
    return DEFAULT_ADMIN_ROUTE.path;
  }

  const route = findAdminRouteByPathname(cleanPathname);
  return route?.path || DEFAULT_ADMIN_ROUTE.path;
}

export function findAdminRouteById(routeId) {
  return ADMIN_ROUTES.find((route) => route.id === routeId) || null;
}

export function findAdminRouteByPathname(pathname = '') {
  const cleanPathname = trimTrailingSlash(pathname);
  return ADMIN_ROUTES.find((route) => route.path === cleanPathname) || null;
}

export function resolveAdminRoute(pathname = '') {
  const canonicalPath = normalizeAdminPathname(pathname);
  const route = findAdminRouteByPathname(canonicalPath) || DEFAULT_ADMIN_ROUTE;

  return {
    route,
    canonicalPath,
    shouldReplace: (pathname || '') !== canonicalPath,
  };
}
