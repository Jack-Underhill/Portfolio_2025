import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { normalizeUploadedZipSourceFile } from '../../../../../server/admin/agent/sourceIngestion/zipSource.js';
import { createPdfBuffer } from './pdfTestFixture.js';

const encoder = new TextEncoder();

async function createZipBuffer(entries) {
  const zip = new JSZip();

  entries.forEach(({ path, text, bytes }) => {
    zip.file(path, bytes || text || '');
  });

  return new Uint8Array(await zip.generateAsync({ type: 'uint8array' }));
}

function createFakeFile({ name = 'bundle.zip', bytes, type = 'application/zip', size }) {
  const data = bytes || encoder.encode('');

  return {
    name,
    size: size ?? data.byteLength,
    type,
    arrayBuffer: async () => data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ),
  };
}

function createIdFactory() {
  let index = 1;
  return () => `source-${index++}`;
}

function expectSkippedEntry(entry, { id, label, warning, bytes }) {
  expect(entry).toEqual(expect.objectContaining({
    item: null,
    manifest: expect.objectContaining({
      label,
      included: false,
      warnings: [warning],
      ...(id == null ? {} : { id }),
      ...(bytes == null ? {} : { bytes }),
    }),
  }));
}

describe('project agent zip source normalization', () => {
  it('extracts supported text and PDF entries while reporting unsupported entries', async () => {
    const result = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'evidence.zip',
        bytes: await createZipBuffer([
          { path: 'docs/notes.md', text: '# Notes' },
          { path: 'docs/report.pdf', bytes: createPdfBuffer('PDF zip source evidence') },
          { path: 'images/screenshot.png', bytes: new Uint8Array([1, 2, 3]) },
        ]),
      }),
      { createId: createIdFactory() },
    );

    expect(result.entries[0]).toEqual(expect.objectContaining({
      item: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'evidence.zip / docs/notes.md',
        text: '# Notes',
        archiveLabel: 'evidence.zip',
        path: 'docs/notes.md',
      }),
      manifest: expect.objectContaining({
        id: 'source-1',
        included: true,
        archiveLabel: 'evidence.zip',
        path: 'docs/notes.md',
        extractedBytes: 7,
        warnings: [],
      }),
    }));
    expect(result.entries[1]).toEqual(expect.objectContaining({
      item: expect.objectContaining({
        id: 'source-2',
        kind: 'pdf',
        label: 'evidence.zip / docs/report.pdf',
        text: '[PDF: evidence.zip / docs/report.pdf]\n[Page 1]\nPDF zip source evidence',
      }),
      manifest: expect.objectContaining({
        id: 'source-2',
        kind: 'pdf',
        included: true,
        archiveLabel: 'evidence.zip',
        path: 'docs/report.pdf',
        pages: 1,
        warnings: [],
      }),
    }));
    expectSkippedEntry(result.entries[2], {
      id: 'source-3',
      label: 'evidence.zip / images/screenshot.png',
      warning: 'Skipped unsupported zip entry "evidence.zip / images/screenshot.png".',
    });
    result.entries.forEach(({ manifest }) => {
      expect(manifest).not.toHaveProperty('text');
    });
    expect(result.warnings).toEqual([
      'Skipped 1 zip source entry from "evidence.zip" due to unsupported file types. Examples: evidence.zip / images/screenshot.png.',
    ]);
  });

  it('reports unsafe, unsupported, binary-looking, nested, and ignored entries deterministically', async () => {
    const result = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'mixed.zip',
        bytes: await createZipBuffer([
          { path: '../secret.txt', text: 'do not read' },
          { path: 'node_modules/pkg/index.js', text: 'ignored dependency' },
          { path: 'nested/archive.zip', text: 'nested zip' },
          { path: 'assets/logo.png', bytes: new Uint8Array([1, 2, 3]) },
          { path: 'docs/binary.txt', bytes: new Uint8Array([0, 1, 2, 3]) },
        ]),
      }),
      { createId: createIdFactory() },
    );

    [
      ['source-1', 'mixed.zip / docs/binary.txt', 'Skipped binary-looking zip entry "mixed.zip / docs/binary.txt".'],
      ['source-2', 'mixed.zip / assets/logo.png', 'Skipped unsupported zip entry "mixed.zip / assets/logo.png".'],
      ['source-3', 'mixed.zip / nested/archive.zip', 'Skipped nested zip entry "mixed.zip / nested/archive.zip".'],
      ['source-4', 'mixed.zip / node_modules/pkg/index.js', 'Skipped ignored zip entry "mixed.zip / node_modules/pkg/index.js".'],
      ['source-5', 'mixed.zip / secret.txt', 'Skipped unsafe zip entry "mixed.zip / secret.txt".'],
    ].forEach(([id, label, warning], index) => {
      expectSkippedEntry(result.entries[index], { id, label, warning });
    });
    expect(result.warnings).toEqual([
      'Skipped 1 zip source entry from "mixed.zip" due to binary-looking entries. Examples: mixed.zip / docs/binary.txt.',
      'Skipped 1 zip source entry from "mixed.zip" due to unsupported file types. Examples: mixed.zip / assets/logo.png.',
      'Skipped 1 zip source entry from "mixed.zip" due to nested zip entries. Examples: mixed.zip / nested/archive.zip.',
      'Skipped 1 zip source entry from "mixed.zip" due to ignored paths. Examples: mixed.zip / node_modules/pkg/index.js.',
      'Skipped 1 zip source entry from "mixed.zip" due to unsafe paths. Examples: mixed.zip / secret.txt.',
    ]);
  });

  it('prioritizes high-signal zip entries and compacts repeated skipped warnings', async () => {
    const result = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'large-source.zip',
        bytes: await createZipBuffer([
          ...Array.from({ length: 16 }, (_, index) => ({
            path: `assets/noisy-${String(index + 1).padStart(2, '0')}.png`,
            bytes: new Uint8Array([1, 2, 3]),
          })),
          ...Array.from({ length: 16 }, (_, index) => ({
            path: `dist/generated-${String(index + 1).padStart(2, '0')}.js`,
            text: 'ignored generated output',
          })),
          { path: 'README.md', text: '# Project evidence' },
          { path: 'src/App.jsx', text: 'export function App() {}' },
        ]),
      }),
      { createId: createIdFactory(), maxEntries: 40 },
    );

    expect(result.entries.filter((entry) => entry.item).map((entry) => entry.item.path)).toEqual([
      'README.md',
      'src/App.jsx',
    ]);
    expect(result.entries[0].item).toEqual(expect.objectContaining({
      id: 'source-1',
      label: 'large-source.zip / README.md',
    }));
    expect(result.entries[1].item).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'large-source.zip / src/App.jsx',
    }));
    expect(result.entries).toHaveLength(34);
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.length).toBeLessThanOrEqual(25);
    expect(result.warnings).toEqual([
      'Skipped 16 zip source entries from "large-source.zip" due to unsupported file types. Examples: large-source.zip / assets/noisy-01.png; large-source.zip / assets/noisy-02.png; large-source.zip / assets/noisy-03.png.',
      'Skipped 16 zip source entries from "large-source.zip" due to ignored paths. Examples: large-source.zip / dist/generated-01.js; large-source.zip / dist/generated-02.js; large-source.zip / dist/generated-03.js.',
    ]);
    expect(result.entries.find((entry) => entry.manifest.label === 'large-source.zip / assets/noisy-01.png').manifest.warnings).toEqual([
      'Skipped unsupported zip entry "large-source.zip / assets/noisy-01.png".',
    ]);
  });

  it('inspects source files before build output artifacts when entry inspection is limited', async () => {
    const result = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'coursework.zip',
        bytes: await createZipBuffer([
          { path: 'Project.Tests/bin/Debug/net10.0-windows/Project.Tests.deps.json', text: '{"runtimeTarget":{}}' },
          { path: 'Project.Tests/obj/Debug/net10.0-windows/Project.Tests.xml', text: '<doc />' },
          { path: 'Project.Tests/TestResults/coverage.xml', text: '<coverage />' },
          { path: 'ZEngine/Spreadsheet.cs', text: 'public sealed class Spreadsheet {}' },
        ]),
      }),
      { createId: createIdFactory(), maxEntries: 2 },
    );

    expect(result.entries[0].manifest.warnings).toEqual([
      'Zip source file "coursework.zip" has 4 entries; only the first 2 entries were inspected.',
    ]);
    expect(result.entries[1].item).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'coursework.zip / ZEngine/Spreadsheet.cs',
      path: 'ZEngine/Spreadsheet.cs',
      text: 'public sealed class Spreadsheet {}',
    }));
    expectSkippedEntry(result.entries[2], {
      id: 'source-3',
      label: 'coursework.zip / Project.Tests/bin/Debug/net10.0-windows/Project.Tests.deps.json',
      warning: 'Skipped ignored zip entry "coursework.zip / Project.Tests/bin/Debug/net10.0-windows/Project.Tests.deps.json".',
    });
    expect(result.warnings).toEqual([
      'Zip source file "coursework.zip" has 4 entries; only the first 2 entries were inspected.',
      'Skipped 1 zip source entry from "coursework.zip" due to ignored paths. Examples: coursework.zip / Project.Tests/bin/Debug/net10.0-windows/Project.Tests.deps.json.',
    ]);
  });

  it('applies the broad developer text policy to zip entries', async () => {
    const result = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'developer.zip',
        bytes: await createZipBuffer([
          { path: 'Dockerfile', text: 'FROM node:22' },
          { path: 'src/main.go', text: 'package main' },
          { path: '.env', text: 'TOKEN=secret' },
          { path: 'generated/client.ts', text: 'export const generated = true;' },
          { path: 'public/app.min.js', text: 'console.log("minified")' },
        ]),
      }),
      { createId: createIdFactory() },
    );

    const entriesByLabel = new Map(result.entries.map((entry) => [entry.manifest.label, entry]));

    expect(entriesByLabel.get('developer.zip / Dockerfile')).toEqual(expect.objectContaining({
      item: expect.objectContaining({
        kind: 'file',
        label: 'developer.zip / Dockerfile',
        text: 'FROM node:22',
      }),
      manifest: expect.objectContaining({
        included: true,
        archiveLabel: 'developer.zip',
        path: 'Dockerfile',
        warnings: [],
      }),
    }));
    expect(entriesByLabel.get('developer.zip / src/main.go')).toEqual(expect.objectContaining({
      item: expect.objectContaining({
        kind: 'file',
        label: 'developer.zip / src/main.go',
        text: 'package main',
      }),
      manifest: expect.objectContaining({
        included: true,
        archiveLabel: 'developer.zip',
        path: 'src/main.go',
        warnings: [],
      }),
    }));
    expectSkippedEntry(entriesByLabel.get('developer.zip / .env'), {
      label: 'developer.zip / .env',
      warning: 'Skipped disallowed zip entry "developer.zip / .env".',
    });
    expectSkippedEntry(entriesByLabel.get('developer.zip / generated/client.ts'), {
      label: 'developer.zip / generated/client.ts',
      warning: 'Skipped ignored zip entry "developer.zip / generated/client.ts".',
    });
    expectSkippedEntry(entriesByLabel.get('developer.zip / public/app.min.js'), {
      label: 'developer.zip / public/app.min.js',
      warning: 'Skipped disallowed zip entry "developer.zip / public/app.min.js".',
    });
  });

  it('enforces entry count, included file, per-entry byte, and total extracted byte limits', async () => {
    const countAndIncludedLimit = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'limits.zip',
        bytes: await createZipBuffer([
          { path: 'a.md', text: 'aaaa' },
          { path: 'b.md', text: 'bbbb' },
          { path: 'c.md', text: 'cccc' },
          { path: 'd.md', text: 'dddd' },
        ]),
      }),
      { createId: createIdFactory(), maxEntries: 3, maxIncludedFiles: 1 },
    );

    expect(countAndIncludedLimit.entries[0].manifest.warnings).toEqual([
      'Zip source file "limits.zip" has 4 entries; only the first 3 entries were inspected.',
    ]);
    expect(countAndIncludedLimit.entries[1].item).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'limits.zip / a.md',
      text: 'aaaa',
    }));
    expectSkippedEntry(countAndIncludedLimit.entries[2], {
      id: 'source-3',
      label: 'limits.zip / b.md',
      warning: 'Skipped zip entry "limits.zip / b.md" because the 1 included file limit was reached.',
    });
    expectSkippedEntry(countAndIncludedLimit.entries[3], {
      id: 'source-4',
      label: 'limits.zip / c.md',
      warning: 'Skipped zip entry "limits.zip / c.md" because the 1 included file limit was reached.',
    });

    const totalLimit = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'total.zip',
        bytes: await createZipBuffer([
          { path: 'a.md', text: 'aaaa' },
          { path: 'b.md', text: 'bbbb' },
        ]),
      }),
      { createId: createIdFactory(), maxTotalExtractedBytes: 6 },
    );

    expect(totalLimit.entries[0].item).toEqual(expect.objectContaining({
      id: 'source-1',
      label: 'total.zip / a.md',
    }));
    expectSkippedEntry(totalLimit.entries[1], {
      id: 'source-2',
      label: 'total.zip / b.md',
      warning: 'Skipped zip entry "total.zip / b.md" because the 6 byte total extracted limit was reached.',
    });

    const entryLimit = await normalizeUploadedZipSourceFile(
      createFakeFile({
        name: 'entry-limit.zip',
        bytes: await createZipBuffer([{ path: 'huge.md', text: 'abcd' }]),
      }),
      { createId: createIdFactory(), maxEntryBytes: 3 },
    );

    expectSkippedEntry(entryLimit.entries[0], {
      id: 'source-1',
      label: 'entry-limit.zip / huge.md',
      bytes: 4,
      warning: 'Skipped oversized zip entry "entry-limit.zip / huge.md" because it exceeds the 3 byte limit.',
    });
  });

  it('skips oversized and unreadable archives with metadata-only manifests', async () => {
    const archiveCases = [
      {
        file: {
          name: 'huge.zip',
          size: 21 * 1024 * 1024,
          type: 'application/zip',
          arrayBuffer: async () => {
            throw new Error('should not read oversized zip');
          },
        },
        warning: 'Zip source file "huge.zip" exceeds the 20971520 byte limit.',
      },
      {
        file: createFakeFile({ name: 'broken.zip', bytes: encoder.encode('not a zip') }),
        warning: 'Zip source file "broken.zip" could not be inspected.',
      },
    ];

    for (const { file, warning } of archiveCases) {
      const result = await normalizeUploadedZipSourceFile(file, { id: 'source-1' });

      expect(result.entries).toEqual([
        expect.objectContaining({
          item: null,
          manifest: expect.objectContaining({
            id: 'source-1',
            kind: 'zip',
            label: file.name,
            included: false,
            warnings: [warning],
          }),
        }),
      ]);
      expect(result.entries[0].manifest).not.toHaveProperty('text');
    }
  });
});
