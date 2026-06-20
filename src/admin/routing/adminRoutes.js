import { PUBLIC_ROUTES } from '../../runtime/paths.js';
import {
  DEFAULT_PROJECT_EDITOR_SECTION,
  PROJECT_EDITOR_SECTIONS,
  findProjectEditorSection,
} from '../projects/projectEditorSections.js';

export const ADMIN_ROUTE_IDS = Object.freeze({
  ABOUT: 'about',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  CERTIFICATIONS: 'certifications',
  SKILLS: 'skills',
  CONTACT: 'contact',
});

const ADMIN_PROJECTS_BASE_PATH = `${PUBLIC_ROUTES.ADMIN_BASE}/projects`;

export function getProjectSubsectionPath(sectionId = DEFAULT_PROJECT_EDITOR_SECTION.id) {
  return `${ADMIN_PROJECTS_BASE_PATH}/${sectionId}`;
}

export const PROJECT_SUBSECTION_ROUTES = Object.freeze(
  PROJECT_EDITOR_SECTIONS.map((section) => Object.freeze({
    id: section.id,
    title: section.title,
    path: getProjectSubsectionPath(section.id),
  })),
);

export const ADMIN_ROUTES = Object.freeze([
  Object.freeze({
    id: ADMIN_ROUTE_IDS.ABOUT,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/about`,
    label: 'About',
    icon: 'user',
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.PROJECTS,
    path: getProjectSubsectionPath(),
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
export const DEFAULT_PROJECT_SUBSECTION_ROUTE = PROJECT_SUBSECTION_ROUTES[0];

function trimTrailingSlash(pathname) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function resolveProjectSubsectionPath(cleanPathname) {
  if (cleanPathname === ADMIN_PROJECTS_BASE_PATH) {
    return DEFAULT_PROJECT_SUBSECTION_ROUTE;
  }

  const sectionId = cleanPathname.startsWith(`${ADMIN_PROJECTS_BASE_PATH}/`)
    ? cleanPathname.slice(`${ADMIN_PROJECTS_BASE_PATH}/`.length)
    : '';
  const section = findProjectEditorSection(sectionId);

  if (!section) {
    return null;
  }

  return PROJECT_SUBSECTION_ROUTES.find((route) => route.id === section.id) || null;
}

export function normalizeAdminPathname(pathname = '') {
  const cleanPathname = trimTrailingSlash(pathname || PUBLIC_ROUTES.ADMIN_BASE);

  if (cleanPathname === PUBLIC_ROUTES.ADMIN_BASE) {
    return DEFAULT_ADMIN_ROUTE.path;
  }

  if (cleanPathname === ADMIN_PROJECTS_BASE_PATH) {
    return DEFAULT_PROJECT_SUBSECTION_ROUTE.path;
  }

  if (cleanPathname.startsWith(`${ADMIN_PROJECTS_BASE_PATH}/`)) {
    return resolveProjectSubsectionPath(cleanPathname)?.path || DEFAULT_PROJECT_SUBSECTION_ROUTE.path;
  }

  const route = findAdminRouteByPathname(cleanPathname);
  return route?.path || DEFAULT_ADMIN_ROUTE.path;
}

export function findAdminRouteById(routeId) {
  return ADMIN_ROUTES.find((route) => route.id === routeId) || null;
}

export function findAdminRouteByPathname(pathname = '') {
  const cleanPathname = trimTrailingSlash(pathname);
  const projectSubsectionRoute = resolveProjectSubsectionPath(cleanPathname);

  if (projectSubsectionRoute) {
    return findAdminRouteById(ADMIN_ROUTE_IDS.PROJECTS);
  }

  return ADMIN_ROUTES.find((route) => route.path === cleanPathname) || null;
}

export function resolveAdminRoute(pathname = '') {
  const canonicalPath = normalizeAdminPathname(pathname);
  const route = findAdminRouteByPathname(canonicalPath) || DEFAULT_ADMIN_ROUTE;
  const projectSubsectionRoute = route.id === ADMIN_ROUTE_IDS.PROJECTS
    ? resolveProjectSubsectionPath(canonicalPath)
    : null;

  return {
    route,
    projectSubsectionId: projectSubsectionRoute?.id || null,
    canonicalPath,
    shouldReplace: (pathname || '') !== canonicalPath,
  };
}
