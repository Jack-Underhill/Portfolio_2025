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

export const ADMIN_PROJECTS_PATH = `${PUBLIC_ROUTES.ADMIN_BASE}/projects`;

export const ADMIN_SCROLL_TARGET_TYPES = Object.freeze({
  ROOT_SECTION: 'root-section',
  PROJECT_SUBSECTION: 'project-subsection',
});

function createScrollTarget(type, id) {
  return Object.freeze({ type, id });
}

function createRootScrollTarget(routeId) {
  return createScrollTarget(ADMIN_SCROLL_TARGET_TYPES.ROOT_SECTION, routeId);
}

function createProjectSubsectionScrollTarget(sectionId) {
  return createScrollTarget(ADMIN_SCROLL_TARGET_TYPES.PROJECT_SUBSECTION, sectionId);
}

export function getProjectSubsectionPath(sectionId = DEFAULT_PROJECT_EDITOR_SECTION.id) {
  return `${ADMIN_PROJECTS_PATH}/${sectionId}`;
}

export const PROJECT_SUBSECTION_ROUTES = Object.freeze(
  PROJECT_EDITOR_SECTIONS.map((section) => Object.freeze({
    id: section.id,
    title: section.title,
    path: getProjectSubsectionPath(section.id),
    scrollTarget: createProjectSubsectionScrollTarget(section.id),
  })),
);

export const ADMIN_ROUTES = Object.freeze([
  Object.freeze({
    id: ADMIN_ROUTE_IDS.ABOUT,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/about`,
    label: 'About',
    icon: 'user',
    accent: 'sky',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.ABOUT),
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.PROJECTS,
    path: ADMIN_PROJECTS_PATH,
    label: 'Projects',
    icon: 'folder',
    accent: 'cyan',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.PROJECTS),
    children: PROJECT_SUBSECTION_ROUTES,
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.EDUCATION,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/education`,
    label: 'Education',
    icon: 'graduation',
    accent: 'indigo',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.EDUCATION),
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.CERTIFICATIONS,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/certifications`,
    label: 'Certifications',
    icon: 'badge',
    accent: 'violet',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.CERTIFICATIONS),
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.SKILLS,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/skills`,
    label: 'Skills',
    icon: 'spark',
    accent: 'teal',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.SKILLS),
  }),
  Object.freeze({
    id: ADMIN_ROUTE_IDS.CONTACT,
    path: `${PUBLIC_ROUTES.ADMIN_BASE}/contact`,
    label: 'Contact',
    icon: 'mail',
    accent: 'blue',
    scrollTarget: createRootScrollTarget(ADMIN_ROUTE_IDS.CONTACT),
  }),
]);

export const DEFAULT_ADMIN_ROUTE = ADMIN_ROUTES[0];
export const DEFAULT_PROJECT_SUBSECTION_ROUTE = PROJECT_SUBSECTION_ROUTES[0];

export const ADMIN_WORKFLOW_LOCATIONS = Object.freeze(
  ADMIN_ROUTES.flatMap((route) => [
    Object.freeze({
      id: route.id,
      routeId: route.id,
      parentId: null,
    }),
    ...(route.children || []).map((childRoute) => Object.freeze({
      id: `${route.id}/${childRoute.id}`,
      routeId: route.id,
      parentId: route.id,
    })),
  ]),
);

export const ADMIN_WORKFLOW_LOCATION_IDS = Object.freeze(
  ADMIN_WORKFLOW_LOCATIONS.map((location) => location.id),
);

export const ADMIN_OBSERVED_LEAVES = Object.freeze(
  ADMIN_ROUTES.flatMap((route) => {
    if (route.id !== ADMIN_ROUTE_IDS.PROJECTS) {
      return [Object.freeze({
        id: route.id,
        routeId: route.id,
        projectSubsectionId: null,
        path: route.path,
        title: route.label,
        scrollTarget: route.scrollTarget,
        observationTarget: route.scrollTarget,
      })];
    }

    return route.children.map((childRoute, index) => Object.freeze({
      id: `${route.id}/${childRoute.id}`,
      routeId: route.id,
      projectSubsectionId: childRoute.id,
      path: childRoute.path,
      title: childRoute.title,
      scrollTarget: childRoute.scrollTarget,
      observationTarget: index === 0
        ? route.scrollTarget
        : childRoute.scrollTarget,
    }));
  }),
);

export function getAdminWorkflowBranchLocationIds(parentLocationId) {
  return ADMIN_WORKFLOW_LOCATIONS
    .filter((location) => (
      location.id === parentLocationId
      || location.parentId === parentLocationId
    ))
    .map((location) => location.id);
}

function trimTrailingSlash(pathname) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function resolveProjectSubsectionPath(cleanPathname) {
  const sectionId = cleanPathname.startsWith(`${ADMIN_PROJECTS_PATH}/`)
    ? cleanPathname.slice(`${ADMIN_PROJECTS_PATH}/`.length)
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

  if (cleanPathname === ADMIN_PROJECTS_PATH) {
    return ADMIN_PROJECTS_PATH;
  }

  if (cleanPathname.startsWith(`${ADMIN_PROJECTS_PATH}/`)) {
    return resolveProjectSubsectionPath(cleanPathname)?.path || ADMIN_PROJECTS_PATH;
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
