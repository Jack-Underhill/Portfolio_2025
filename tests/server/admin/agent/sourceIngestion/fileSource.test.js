import { describe, expect, it } from 'vitest';

import {
  normalizeUploadedSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
} from '../../../../../server/admin/agent/sourceIngestion/fileSource.js';

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
    expect(PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS).toEqual([
      '.txt',
      '.md',
      '.markdown',
      '.json',
      '.csv',
      '.log',
      '.html',
      '.css',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.py',
      '.sql',
      '.yaml',
      '.yml',
      '.toml',
      '.xml',
      '.ipynb',
    ]);
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

  it('keeps unsupported binary-oriented extensions skipped for later ingestion phases', async () => {
    const result = await normalizeUploadedSourceFile(
      createFakeFile({ name: 'bundle.zip', text: 'not zip parsing yet', type: 'application/zip' }),
      { id: 'source-1', maxBytes: 512 * 1024 },
    );

    expect(result).toEqual({
      item: null,
      manifest: expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'bundle.zip',
        included: false,
        warnings: ['Unsupported source file type for "bundle.zip".'],
      }),
      warnings: ['Skipped unsupported source file "bundle.zip".'],
    });
  });
});
