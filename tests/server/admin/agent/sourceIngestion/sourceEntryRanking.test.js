import { describe, expect, it } from 'vitest';

import {
  getSourceEntryPathRank,
  sortSourceEntriesByPathRank,
} from '../../../../../server/admin/agent/sourceIngestion/sourceEntryRanking.js';

describe('source entry ranking', () => {
  it('ranks source-like paths by signal without provider-specific policy imports', () => {
    expect(getSourceEntryPathRank({ path: 'README.md' })).toBe(0);
    expect(getSourceEntryPathRank({ path: 'docs/setup.md', supported: true })).toBe(10);
    expect(getSourceEntryPathRank({ path: 'package.json' })).toBe(20);
    expect(getSourceEntryPathRank({ path: 'src/main.jsx', supported: true })).toBe(30);
    expect(getSourceEntryPathRank({ path: 'tests/App.test.jsx', supported: true })).toBe(40);
    expect(getSourceEntryPathRank({ path: 'src/components/App.jsx', supported: true })).toBe(50);
    expect(getSourceEntryPathRank({ path: 'screenshots/demo.png', supported: false })).toBe(70);
    expect(getSourceEntryPathRank({
      path: 'dist/generated.min.js',
      ignoreReason: 'ignored path segment "dist"',
      supported: true,
    })).toBe(80);
  });

  it('sorts deterministically by rank and path while preserving the input entries', () => {
    const entries = [
      { path: 'src/components/App.jsx', supported: true },
      { path: 'assets/logo.png', supported: false },
      { path: 'README.md', supported: true },
      { path: 'package.json', supported: true },
      { path: 'dist/app.min.js', supported: true, ignoreReason: 'ignored path segment "dist"' },
      { path: 'docs/setup.md', supported: true },
      { path: 'src/main.jsx', supported: true },
      { path: 'tests/App.test.jsx', supported: true },
    ];

    expect(sortSourceEntriesByPathRank(entries, {
      getIgnoreReason: (entry) => entry.ignoreReason,
      isSupported: (entry) => entry.supported,
    }).map((entry) => entry.path)).toEqual([
      'README.md',
      'docs/setup.md',
      'package.json',
      'src/main.jsx',
      'tests/App.test.jsx',
      'src/components/App.jsx',
      'assets/logo.png',
      'dist/app.min.js',
    ]);
    expect(entries.map((entry) => entry.path)).toEqual([
      'src/components/App.jsx',
      'assets/logo.png',
      'README.md',
      'package.json',
      'dist/app.min.js',
      'docs/setup.md',
      'src/main.jsx',
      'tests/App.test.jsx',
    ]);
    expect(sortSourceEntriesByPathRank(null)).toEqual([]);
  });
});
