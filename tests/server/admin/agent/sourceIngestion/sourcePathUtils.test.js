import { describe, expect, it } from 'vitest';

import {
  cleanUnsafeRelativeSourcePath,
  encodeSourcePathForUrl,
  getSourceFileBaseName,
  getSourceFileExtension,
  getSafeSourceLabel,
  isSafeRelativeSourcePath,
  joinSourceDisplayPath,
  normalizeSourcePathSlashes,
} from '../../../../../server/admin/agent/sourceIngestion/sourcePathUtils.js';

describe('source path utilities', () => {
  it('normalizes slash-separated source paths and reads the final filename segment', () => {
    expect(normalizeSourcePathSlashes('src\\components\\App.tsx')).toBe('src/components/App.tsx');
    expect(getSourceFileBaseName(' bundle.zip / src\\App.tsx ')).toBe('App.tsx');
    expect(getSourceFileExtension('bundle.zip / Dockerfile')).toBe('');
    expect(getSourceFileExtension('bundle.zip / src/App.TSX')).toBe('.tsx');
  });

  it('normalizes display labels with caller-owned fallbacks', () => {
    expect(getSafeSourceLabel('  evidence.md  ')).toBe('evidence.md');
    expect(getSafeSourceLabel('', 'Unnamed PDF source file')).toBe('Unnamed PDF source file');
    expect(getSafeSourceLabel(null)).toBe('Unnamed source file');
  });

  it('validates relative source paths without accepting traversal or absolute paths', () => {
    expect(isSafeRelativeSourcePath('src/App.tsx')).toBe(true);
    expect(isSafeRelativeSourcePath('../secret.txt')).toBe(false);
    expect(isSafeRelativeSourcePath('/src/App.tsx')).toBe(false);
    expect(isSafeRelativeSourcePath('src\\App.tsx')).toBe(false);
    expect(isSafeRelativeSourcePath('C:/Users/source.txt')).toBe(false);
    expect(isSafeRelativeSourcePath('C:/Users/source.txt', { allowWindowsDrivePrefix: true })).toBe(true);
  });

  it('cleans unsafe paths for metadata labels without keeping traversal segments', () => {
    expect(cleanUnsafeRelativeSourcePath('../secret.txt')).toBe('secret.txt');
    expect(cleanUnsafeRelativeSourcePath('C:/Users/source.txt')).toBe('Users/source.txt');
    expect(cleanUnsafeRelativeSourcePath('../../')).toBe('unsafe entry');
  });

  it('builds display paths and URL-encodes source path segments', () => {
    expect(joinSourceDisplayPath('owner/repo', 'src/App.tsx')).toBe('owner/repo / src/App.tsx');
    expect(encodeSourcePathForUrl('docs/API notes.md')).toBe('docs/API%20notes.md');
  });
});
