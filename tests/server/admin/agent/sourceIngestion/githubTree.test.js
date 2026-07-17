import { describe, expect, it } from 'vitest';

import {
  getGitHubTreeWarnings,
  getSortedGitHubBlobEntries,
} from '../../../../../server/admin/agent/sourceIngestion/github/githubTree.js';

describe('GitHub tree helpers', () => {
  it('selects only blob entries with high-signal files first without mutating the input tree', () => {
    const tree = [
      { path: 'src/App.jsx', type: 'blob' },
      { path: 'screenshots/demo.png', type: 'blob' },
      { path: 'docs', type: 'tree' },
      { path: 'README.md', type: 'blob' },
      { path: 'package.json', type: 'blob' },
      { path: 'dist/generated.min.js', type: 'blob' },
      { type: 'blob' },
    ];

    expect(getSortedGitHubBlobEntries(tree)).toEqual([
      { path: 'README.md', type: 'blob' },
      { path: 'package.json', type: 'blob' },
      { path: 'src/App.jsx', type: 'blob' },
      { path: 'screenshots/demo.png', type: 'blob' },
      { type: 'blob' },
      { path: 'dist/generated.min.js', type: 'blob' },
    ]);
    expect(tree.map((entry) => entry.path)).toEqual([
      'src/App.jsx',
      'screenshots/demo.png',
      'docs',
      'README.md',
      'package.json',
      'dist/generated.min.js',
      undefined,
    ]);
    expect(getSortedGitHubBlobEntries(null)).toEqual([]);
  });

  it('reports GitHub tree truncation and local inspection limits', () => {
    expect(getGitHubTreeWarnings({
      repoLabel: 'owner/repo',
      treeResult: { data: { truncated: true } },
      blobEntries: [{}, {}, {}],
      maxTreeEntries: 2,
    })).toEqual([
      'GitHub repository "owner/repo" tree was truncated by GitHub before all files could be inspected.',
      'GitHub repository "owner/repo" has 3 file entries; only the first 2 entries were inspected.',
    ]);

    expect(getGitHubTreeWarnings({
      repoLabel: 'owner/repo',
      treeResult: { data: { truncated: false } },
      blobEntries: [{}, {}],
      maxTreeEntries: 2,
    })).toEqual([]);
  });
});
