import { describe, expect, it } from 'vitest';

import { PROJECT_ROUTE_PATTERN } from '../../../src/domain/projects/constants.js';
import {
  buildProjectPath,
  parseProjectPath,
} from '../../../src/domain/projects/routing.js';
import { PUBLIC_ROUTES } from '../../../src/runtime/paths.js';

describe('project routing helpers', () => {
  it('keeps the public project route pattern scoped to one /p segment', () => {
    expect(PROJECT_ROUTE_PATTERN.test('/p/12-example-project')).toBe(true);
    expect(PROJECT_ROUTE_PATTERN.test('/p/12-example-project/')).toBe(true);
    expect(PROJECT_ROUTE_PATTERN.test('/projects/12-example-project')).toBe(false);
    expect(PROJECT_ROUTE_PATTERN.test('/p/12-example-project/extra')).toBe(false);
  });

  it('parses a numeric project permalink from the public project route', () => {
    expect(parseProjectPath('/p/12-example-project')).toEqual({
      id: 12,
      permalink: '12-example-project',
    });
  });

  it('accepts a trailing slash on project detail routes', () => {
    expect(parseProjectPath('/p/12-example-project/')).toEqual({
      id: 12,
      permalink: '12-example-project',
    });
  });

  it('returns null for paths outside the project route pattern', () => {
    expect(parseProjectPath('/projects/12-example-project')).toBeNull();
    expect(parseProjectPath('/p/12-example-project/extra')).toBeNull();
  });

  it('rejects missing, empty, and non-numeric project segments under /p', () => {
    expect(parseProjectPath('/p')).toBeNull();
    expect(parseProjectPath('/p/')).toBeNull();
    expect(parseProjectPath('/p/example-project')).toBeNull();
  });

  it('decodes encoded route segments after matching the raw route shape', () => {
    expect(parseProjectPath('/p/12-example%20project')).toEqual({
      id: 12,
      permalink: '12-example project',
    });
  });

  it('builds the public project route for a permalink segment', () => {
    expect(buildProjectPath('example-project')).toBe(
      `${PUBLIC_ROUTES.PROJECT_BASE}/example-project`,
    );
  });

  it('encodes unsafe characters when building project routes', () => {
    expect(buildProjectPath('12-example project')).toBe('/p/12-example%20project');
    expect(buildProjectPath('12/example')).toBe('/p/12%2Fexample');
  });

  it('uses the current blank fallback when building project routes', () => {
    expect(buildProjectPath('   ')).toBe('/p/');
    expect(buildProjectPath(null)).toBe('/p/');
  });
});
