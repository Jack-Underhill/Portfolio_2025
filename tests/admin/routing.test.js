import { describe, expect, it } from 'vitest';

import {
  ADMIN_OBSERVED_LEAVES,
  ADMIN_PROJECTS_PATH,
  ADMIN_ROUTE_IDS,
  ADMIN_ROUTES,
  ADMIN_SCROLL_TARGET_TYPES,
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_PROJECT_SUBSECTION_ROUTE,
  PROJECT_SUBSECTION_ROUTES,
  findAdminRouteById,
  findAdminRouteByPathname,
  getProjectSubsectionPath,
  normalizeAdminPathname,
  resolveAdminRoute,
} from '../../src/admin/routing/adminRoutes.js';
import { PROJECT_EDITOR_SECTIONS } from '../../src/admin/projects/projectEditorSections.js';

describe('admin route helpers', () => {
  it('keeps admin route metadata together in navigation order', () => {
    expect(ADMIN_ROUTES.map(({ id, path, label, icon }) => ({
      id,
      path,
      label,
      icon,
    }))).toEqual([
      { id: 'about', path: '/admin/about', label: 'About', icon: 'user' },
      { id: 'projects', path: '/admin/projects', label: 'Projects', icon: 'folder' },
      { id: 'education', path: '/admin/education', label: 'Education', icon: 'graduation' },
      { id: 'certifications', path: '/admin/certifications', label: 'Certifications', icon: 'badge' },
      { id: 'skills', path: '/admin/skills', label: 'Skills', icon: 'spark' },
      { id: 'contact', path: '/admin/contact', label: 'Contact', icon: 'mail' },
    ]);
    expect(DEFAULT_ADMIN_ROUTE.id).toBe(ADMIN_ROUTE_IDS.ABOUT);
  });

  it('derives project subsection routes from project editor sections', () => {
    expect(DEFAULT_PROJECT_SUBSECTION_ROUTE).toMatchObject({
      id: 'classification',
      title: 'Classification',
      path: '/admin/projects/classification',
    });
    expect(PROJECT_SUBSECTION_ROUTES.map(({ id, title, path }) => ({ id, title, path }))).toEqual(
      PROJECT_EDITOR_SECTIONS.map((section) => ({
        id: section.id,
        title: section.title,
        path: `/admin/projects/${section.id}`,
      })),
    );
    expect(getProjectSubsectionPath('media')).toBe('/admin/projects/media');
  });

  it('defines distinct root and child scroll targets', () => {
    const projectsRoute = findAdminRouteById(ADMIN_ROUTE_IDS.PROJECTS);
    const classificationRoute = PROJECT_SUBSECTION_ROUTES[0];

    expect(ADMIN_PROJECTS_PATH).toBe('/admin/projects');
    expect(projectsRoute?.scrollTarget).toEqual({
      type: ADMIN_SCROLL_TARGET_TYPES.ROOT_SECTION,
      id: ADMIN_ROUTE_IDS.PROJECTS,
    });
    expect(classificationRoute.scrollTarget).toEqual({
      type: ADMIN_SCROLL_TARGET_TYPES.PROJECT_SUBSECTION,
      id: 'classification',
    });
  });

  it('exposes Projects subsection routes as child nav metadata', () => {
    const projectsRoute = findAdminRouteById(ADMIN_ROUTE_IDS.PROJECTS);

    expect(projectsRoute?.children).toBe(PROJECT_SUBSECTION_ROUTES);
  });

  it('finds routes by id and canonical pathname', () => {
    expect(findAdminRouteById(ADMIN_ROUTE_IDS.PROJECTS)?.path).toBe('/admin/projects');
    expect(findAdminRouteByPathname('/admin/projects')?.id).toBe(ADMIN_ROUTE_IDS.PROJECTS);
    expect(findAdminRouteByPathname('/admin/contact')?.id).toBe(ADMIN_ROUTE_IDS.CONTACT);
    expect(findAdminRouteByPathname('/admin/projects/media')?.id).toBe(ADMIN_ROUTE_IDS.PROJECTS);
    expect(findAdminRouteById('missing')).toBeNull();
    expect(findAdminRouteByPathname('/admin/missing')).toBeNull();
  });

  it('accepts trailing slashes for known route paths', () => {
    expect(findAdminRouteByPathname('/admin/skills/')?.id).toBe(ADMIN_ROUTE_IDS.SKILLS);
    expect(normalizeAdminPathname('/admin/education/')).toBe('/admin/education');
  });

  it('defaults bare and unknown admin paths to the About route', () => {
    expect(normalizeAdminPathname('/admin')).toBe('/admin/about');
    expect(normalizeAdminPathname('/admin/')).toBe('/admin/about');
    expect(normalizeAdminPathname('/admin/not-real')).toBe('/admin/about');
  });

  it('canonicalizes project section paths predictably', () => {
    expect(normalizeAdminPathname('/admin/projects')).toBe('/admin/projects');
    expect(normalizeAdminPathname('/admin/projects/')).toBe('/admin/projects');
    expect(normalizeAdminPathname('/admin/projects/media')).toBe('/admin/projects/media');
    expect(normalizeAdminPathname('/admin/projects/media/')).toBe('/admin/projects/media');
    expect(normalizeAdminPathname('/admin/projects/not-real')).toBe('/admin/projects');
    expect(normalizeAdminPathname('/admin/projects/media/extra')).toBe('/admin/projects');
  });

  it('derives one ordered observed leaf per scroll location', () => {
    expect(ADMIN_OBSERVED_LEAVES.map((leaf) => ({
      id: leaf.id,
      routeId: leaf.routeId,
      projectSubsectionId: leaf.projectSubsectionId,
      path: leaf.path,
      title: leaf.title,
    }))).toEqual([
      {
        id: 'about',
        routeId: 'about',
        projectSubsectionId: null,
        path: '/admin/about',
        title: 'About',
      },
      ...PROJECT_EDITOR_SECTIONS.map((section) => ({
        id: `projects/${section.id}`,
        routeId: 'projects',
        projectSubsectionId: section.id,
        path: `/admin/projects/${section.id}`,
        title: section.title,
      })),
      {
        id: 'education',
        routeId: 'education',
        projectSubsectionId: null,
        path: '/admin/education',
        title: 'Education',
      },
      {
        id: 'certifications',
        routeId: 'certifications',
        projectSubsectionId: null,
        path: '/admin/certifications',
        title: 'Certifications',
      },
      {
        id: 'skills',
        routeId: 'skills',
        projectSubsectionId: null,
        path: '/admin/skills',
        title: 'Skills',
      },
      {
        id: 'contact',
        routeId: 'contact',
        projectSubsectionId: null,
        path: '/admin/contact',
        title: 'Contact',
      },
    ]);
    expect(new Set(ADMIN_OBSERVED_LEAVES.map((leaf) => leaf.id)).size)
      .toBe(ADMIN_OBSERVED_LEAVES.length);
  });

  it('observes Classification from Projects while retaining its child scroll target', () => {
    const classificationLeaf = ADMIN_OBSERVED_LEAVES.find(
      (leaf) => leaf.projectSubsectionId === 'classification',
    );

    expect(classificationLeaf).toMatchObject({
      id: 'projects/classification',
      scrollTarget: {
        type: ADMIN_SCROLL_TARGET_TYPES.PROJECT_SUBSECTION,
        id: 'classification',
      },
      observationTarget: {
        type: ADMIN_SCROLL_TARGET_TYPES.ROOT_SECTION,
        id: ADMIN_ROUTE_IDS.PROJECTS,
      },
    });
  });

  it('resolves every configured route path to itself without replacement', () => {
    ADMIN_ROUTES.forEach((route) => {
      expect(resolveAdminRoute(route.path)).toMatchObject({
        route: expect.objectContaining({ id: route.id }),
        canonicalPath: route.path,
        shouldReplace: false,
      });
    });

    PROJECT_SUBSECTION_ROUTES.forEach((projectRoute) => {
      expect(resolveAdminRoute(projectRoute.path)).toMatchObject({
        route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
        projectSubsectionId: projectRoute.id,
        canonicalPath: projectRoute.path,
        shouldReplace: false,
      });
    });
  });

  it('reports whether a path should be replaced with its canonical route', () => {
    expect(resolveAdminRoute('/admin/projects')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      projectSubsectionId: null,
      canonicalPath: '/admin/projects',
      shouldReplace: false,
    });

    expect(resolveAdminRoute('/admin/projects/')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      projectSubsectionId: null,
      canonicalPath: '/admin/projects',
      shouldReplace: true,
    });

    expect(resolveAdminRoute('/admin/projects/media/')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      projectSubsectionId: 'media',
      canonicalPath: '/admin/projects/media',
      shouldReplace: true,
    });

    expect(resolveAdminRoute('/admin')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.ABOUT }),
      projectSubsectionId: null,
      canonicalPath: '/admin/about',
      shouldReplace: true,
    });

    expect(resolveAdminRoute('/admin/not-real')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.ABOUT }),
      projectSubsectionId: null,
      canonicalPath: '/admin/about',
      shouldReplace: true,
    });

    expect(resolveAdminRoute('/admin/projects/not-real')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      projectSubsectionId: null,
      canonicalPath: '/admin/projects',
      shouldReplace: true,
    });
  });
});
