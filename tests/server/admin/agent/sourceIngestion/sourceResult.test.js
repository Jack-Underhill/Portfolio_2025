import { describe, expect, it } from 'vitest';

import {
  createIncludedSourceResult,
  createSkippedSourceEntriesResult,
  createSkippedSourceResult,
  createSourceManifest,
  createSourceResultEntry,
  normalizeSourceWarnings,
  stripSourceTextFromManifest,
} from '../../../../../server/admin/agent/sourceIngestion/sourceResult.js';

describe('source result helpers', () => {
  it('normalizes warnings without inventing empty warning entries', () => {
    expect(normalizeSourceWarnings('Skipped source.')).toEqual(['Skipped source.']);
    expect(normalizeSourceWarnings(['First warning.', '', null, 'Second warning.'])).toEqual([
      'First warning.',
      'Second warning.',
    ]);
    expect(normalizeSourceWarnings()).toEqual([]);
  });

  it('builds metadata-only manifests and strips raw text defensively', () => {
    const manifest = createSourceManifest({
      id: 'source-1',
      kind: 'file',
      label: 'notes.md',
      mediaType: 'text/markdown',
      bytes: 12,
      included: true,
      warnings: [],
      metadata: {
        path: 'docs/notes.md',
        text: 'raw source must not leak',
      },
    });

    expect(manifest).toEqual({
      id: 'source-1',
      kind: 'file',
      label: 'notes.md',
      mediaType: 'text/markdown',
      bytes: 12,
      included: true,
      warnings: [],
      path: 'docs/notes.md',
    });
    expect(stripSourceTextFromManifest({ label: 'notes.md', text: 'raw' })).toEqual({
      label: 'notes.md',
    });
  });

  it('creates included and skipped source results with explicit domain metadata', () => {
    const included = createIncludedSourceResult({
      id: 'source-1',
      kind: 'pdf',
      label: 'report.pdf',
      mediaType: 'application/pdf',
      bytes: 42,
      text: 'extracted evidence',
      warnings: ['Truncated report.pdf.'],
      manifestMetadata: {
        pages: 3,
        text: 'raw manifest text should be stripped',
      },
    });

    expect(included.item).toEqual(expect.objectContaining({
      id: 'source-1',
      kind: 'pdf',
      text: 'extracted evidence',
    }));
    expect(included.manifest).toEqual({
      id: 'source-1',
      kind: 'pdf',
      label: 'report.pdf',
      mediaType: 'application/pdf',
      bytes: 42,
      included: true,
      warnings: ['Truncated report.pdf.'],
      pages: 3,
    });

    const skipped = createSkippedSourceResult({
      id: 'source-2',
      kind: 'file',
      label: 'image.png',
      warning: 'Skipped unsupported source file "image.png".',
      manifestMetadata: {
        path: 'image.png',
      },
    });

    expect(skipped).toEqual({
      item: null,
      manifest: {
        id: 'source-2',
        kind: 'file',
        label: 'image.png',
        bytes: 0,
        included: false,
        warnings: ['Skipped unsupported source file "image.png".'],
        path: 'image.png',
      },
      warnings: ['Skipped unsupported source file "image.png".'],
    });
  });

  it('returns lean entry shapes for multi-entry source callers', () => {
    const result = createSkippedSourceEntriesResult({
      id: 'source-1',
      kind: 'zip',
      label: 'archive.zip',
      mediaType: 'application/zip',
      bytes: 128,
      warning: 'Zip source file "archive.zip" could not be inspected.',
    });

    expect(result).toEqual({
      entries: [
        {
          item: null,
          manifest: {
            id: 'source-1',
            kind: 'zip',
            label: 'archive.zip',
            mediaType: 'application/zip',
            bytes: 128,
            included: false,
            warnings: ['Zip source file "archive.zip" could not be inspected.'],
          },
        },
      ],
      warnings: ['Zip source file "archive.zip" could not be inspected.'],
    });
    expect(createSourceResultEntry({ item: null, manifest: { text: 'raw', included: false } })).toEqual({
      item: null,
      manifest: { included: false },
    });
  });
});
