import { describe, expect, it } from 'vitest';

import {
  normalizeUploadedSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
} from '../../../../../server/admin/agent/sourceIngestion/fileSource.js';
import { createPdfBuffer } from './pdfTestFixture.js';

const encoder = new TextEncoder();

function createFakeFile({ name, text, type = 'text/plain', bytes }) {
  const encoded = bytes || encoder.encode(text ?? '');

  return {
    name,
    size: encoded.byteLength,
    type,
    arrayBuffer: async () => encoded.buffer.slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength,
    ),
  };
}

describe('project agent source file dispatcher', () => {
  it('exposes the expanded direct text and code extension allowlist', () => {
    expect(PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS).toEqual(expect.arrayContaining([
      '.txt',
      '.md',
      '.java',
      '.cpp',
      '.cs',
      '.go',
      '.rs',
      '.vue',
      '.svelte',
      '.astro',
      '.scss',
      '.graphql',
      '.proto',
      '.dockerfile',
      '.ipynb',
      '.pdf',
      '.zip',
    ]));
  });

  it('routes supported direct code files through text normalization', async () => {
    const result = await normalizeUploadedSourceFile(
      createFakeFile({ name: 'worker.ts', text: 'export const ok = true;', type: '' }),
      { id: 'source-1', maxBytes: 512 * 1024 },
    );

    expect(result).toEqual({
      item: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'worker.ts',
        mediaType: 'text/typescript',
        text: 'export const ok = true;',
      }),
      manifest: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'worker.ts',
        mediaType: 'text/typescript',
        included: true,
        warnings: [],
      }),
      warnings: [],
    });
    expect(result.manifest).not.toHaveProperty('text');
  });

  it('routes safe extensionless developer files through text normalization', async () => {
    const result = await normalizeUploadedSourceFile(
      createFakeFile({ name: 'Dockerfile', text: 'FROM node:22', type: '' }),
      { id: 'source-1', maxBytes: 512 * 1024 },
    );

    expect(result).toEqual({
      item: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'Dockerfile',
        mediaType: 'text/plain',
        text: 'FROM node:22',
      }),
      manifest: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'Dockerfile',
        mediaType: 'text/plain',
        included: true,
        warnings: [],
      }),
      warnings: [],
    });
  });

  it('routes direct PDF files through PDF normalization', async () => {
    const result = await normalizeUploadedSourceFile(
      createFakeFile({
        name: 'evidence.pdf',
        bytes: createPdfBuffer('PDF dispatcher evidence'),
        type: 'application/pdf',
      }),
      { id: 'source-1' },
    );

    expect(result).toEqual({
      item: expect.objectContaining({
        id: 'source-1',
        kind: 'pdf',
        label: 'evidence.pdf',
        mediaType: 'application/pdf',
        text: '[PDF: evidence.pdf]\n[Page 1]\nPDF dispatcher evidence',
      }),
      manifest: expect.objectContaining({
        id: 'source-1',
        kind: 'pdf',
        label: 'evidence.pdf',
        mediaType: 'application/pdf',
        included: true,
        warnings: [],
        pages: 1,
      }),
      warnings: [],
    });
    expect(result.manifest).not.toHaveProperty('text');
  });

  it('routes direct zip files through zip normalization', async () => {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    zip.file('docs/notes.md', '# Notes');
    const bytes = await zip.generateAsync({ type: 'uint8array' });

    const result = await normalizeUploadedSourceFile(
      createFakeFile({ name: 'bundle.zip', bytes, type: 'application/zip' }),
      {
        id: 'source-1',
        createId: () => 'source-1',
        maxBytes: 512 * 1024,
      },
    );

    expect(result.entries).toEqual([
      expect.objectContaining({
        item: expect.objectContaining({
          id: 'source-1',
          kind: 'file',
          label: 'bundle.zip / docs/notes.md',
          text: '# Notes',
        }),
        manifest: expect.objectContaining({
          id: 'source-1',
          label: 'bundle.zip / docs/notes.md',
          included: true,
          archiveLabel: 'bundle.zip',
          path: 'docs/notes.md',
          warnings: [],
        }),
      }),
    ]);
    expect(result.entries[0].manifest).not.toHaveProperty('text');
    expect(result.warnings).toEqual([]);
  });
});
