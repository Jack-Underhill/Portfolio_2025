import { describe, expect, it } from 'vitest';

import {
  ADMIN_ROUTE_IDS,
  ADMIN_ROUTES,
  DEFAULT_ADMIN_ROUTE,
  findAdminRouteById,
  findAdminRouteByPathname,
  normalizeAdminPathname,
  resolveAdminRoute,
} from '../../src/admin/routing/adminRoutes.js';

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

  it('finds routes by id and canonical pathname', () => {
    expect(findAdminRouteById(ADMIN_ROUTE_IDS.PROJECTS)?.path).toBe('/admin/projects');
    expect(findAdminRouteByPathname('/admin/contact')?.id).toBe(ADMIN_ROUTE_IDS.CONTACT);
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

  it('reports whether a path should be replaced with its canonical route', () => {
    expect(resolveAdminRoute('/admin/projects')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      canonicalPath: '/admin/projects',
      shouldReplace: false,
    });

    expect(resolveAdminRoute('/admin/projects/')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.PROJECTS }),
      canonicalPath: '/admin/projects',
      shouldReplace: true,
    });

    expect(resolveAdminRoute('/admin')).toMatchObject({
      route: expect.objectContaining({ id: ADMIN_ROUTE_IDS.ABOUT }),
      canonicalPath: '/admin/about',
      shouldReplace: true,
    });
  });
});
