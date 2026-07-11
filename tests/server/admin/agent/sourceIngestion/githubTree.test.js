import { describe, expect, it } from 'vitest';

import {
  getGitHubTreeWarnings,
  getSortedGitHubBlobEntries,
} from '../../../../../server/admin/agent/sourceIngestion/github/githubTree.js';

describe('GitHub tree helpers', () => {
  it('selects only blob entries and sorts them without mutating the input tree', () => {
    const tree = [
      { path: 'src/App.jsx', type: 'blob' },
      { path: 'docs', type: 'tree' },
      { path: 'README.md', type: 'blob' },
      { type: 'blob' },
    ];

    expect(getSortedGitHubBlobEntries(tree)).toEqual([
      { type: 'blob' },
      { path: 'README.md', type: 'blob' },
      { path: 'src/App.jsx', type: 'blob' },
    ]);
    expect(tree.map((entry) => entry.path)).toEqual(['src/App.jsx', 'docs', 'README.md', undefined]);
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
