import { describe, expect, it } from 'vitest';

import { getGitHubPathIgnoreReason } from '../../../../../server/admin/agent/sourceIngestion/github/githubPathPolicy.js';

describe('GitHub source path policy', () => {
  it('rejects unsafe relative paths before GitHub blob fetches', () => {
    expect(getGitHubPathIgnoreReason('../secret.js')).toBe('unsafe path');
    expect(getGitHubPathIgnoreReason('/absolute.js')).toBe('unsafe path');
    expect(getGitHubPathIgnoreReason('src\\App.jsx')).toBe('unsafe path');
  });

  it('identifies dependency, build, noisy, generated, and minified repo paths', () => {
    expect(getGitHubPathIgnoreReason('node_modules/pkg/index.js')).toBe(
      'ignored path segment "node_modules"',
    );
    expect(getGitHubPathIgnoreReason('dist/app.js')).toBe('ignored path segment "dist"');
    expect(getGitHubPathIgnoreReason('package-lock.json')).toBe(
      'noisy generated file "package-lock.json"',
    );
    expect(getGitHubPathIgnoreReason('src/client.generated.js')).toBe(
      'generated or minified file "client.generated.js"',
    );
    expect(getGitHubPathIgnoreReason('src/app.min.css')).toBe(
      'generated or minified file "app.min.css"',
    );
  });

  it('allows ordinary source paths for later text validation', () => {
    expect(getGitHubPathIgnoreReason('src/App.jsx')).toBe('');
    expect(getGitHubPathIgnoreReason('README')).toBe('');
  });
});
