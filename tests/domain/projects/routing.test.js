import { describe, expect, it } from 'vitest';

import { buildProjectPath } from '../../../src/domain/projects/routing.js';

describe('project routing helpers', () => {
  it('builds the public project route for a permalink segment', () => {
    expect(buildProjectPath('example-project')).toBe('/p/example-project');
  });
});
