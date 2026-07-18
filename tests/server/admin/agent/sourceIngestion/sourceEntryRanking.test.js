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
    expect(getSourceEntryPathRank({ path: 'src/components/App.jsx', supported: true })).toBe(40);
    expect(getSourceEntryPathRank({ path: 'SpreadsheetEngine/Cell.cs', supported: true })).toBe(50);
    expect(getSourceEntryPathRank({ path: 'tests/App.test.jsx', supported: true })).toBe(60);
    expect(getSourceEntryPathRank({ path: 'Spreadsheet_Jack_Underhill.Tests/CellTests.cs', supported: true })).toBe(60);
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
      { path: 'Spreadsheet_Jack_Underhill.Tests/CellTests.cs', supported: true },
      { path: 'SpreadsheetEngine/Cell.cs', supported: true },
    ];

    expect(sortSourceEntriesByPathRank(entries, {
      getIgnoreReason: (entry) => entry.ignoreReason,
      isSupported: (entry) => entry.supported,
    }).map((entry) => entry.path)).toEqual([
      'README.md',
      'docs/setup.md',
      'package.json',
      'src/main.jsx',
      'src/components/App.jsx',
      'SpreadsheetEngine/Cell.cs',
      'Spreadsheet_Jack_Underhill.Tests/CellTests.cs',
      'tests/App.test.jsx',
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
      'Spreadsheet_Jack_Underhill.Tests/CellTests.cs',
      'SpreadsheetEngine/Cell.cs',
    ]);
    expect(sortSourceEntriesByPathRank(null)).toEqual([]);
  });

  it('diversifies supported source entries across project areas with representative tests', () => {
    const entries = [
      { path: 'DesktopApp/Form1.cs', supported: true },
      { path: 'DesktopApp/Form1.Designer.cs', supported: true },
      { path: 'DesktopApp/Program.cs', supported: true },
      { path: 'CoreEngine/Cell.cs', supported: true },
      { path: 'CoreEngine/ExpressionTree.cs', supported: true },
      { path: 'CoreEngine/Nodes/OperatorNode.cs', supported: true },
      { path: 'CoreEngine.Tests/CellTests.cs', supported: true },
      { path: 'tests/expression.spec.ts', supported: true },
    ];

    expect(sortSourceEntriesByPathRank(entries, {
      isSupported: (entry) => entry.supported,
    }).map((entry) => entry.path).slice(0, 6)).toEqual([
      'CoreEngine/Cell.cs',
      'DesktopApp/Form1.cs',
      'CoreEngine.Tests/CellTests.cs',
      'CoreEngine/ExpressionTree.cs',
      'DesktopApp/Form1.Designer.cs',
      'CoreEngine/Nodes/OperatorNode.cs',
    ]);
  });
});
