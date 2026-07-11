import { describe, expect, it } from 'vitest';

import {
  getSourceFileExtension,
  isSupportedTextSourceFileName,
  normalizeNamedTextSourceBytes,
  normalizeUploadedTextSourceFile,
} from '../../../../../server/admin/agent/sourceIngestion/textSource.js';

const encoder = new TextEncoder();

function createFakeFile({ name, text = 'source evidence', type = '', bytes }) {
  const encoded = bytes || encoder.encode(text);

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

describe('project agent text source normalization', () => {
  it('supports broad developer text and code extensions', async () => {
    const supportedNames = [
      'Main.java',
      'native.cpp',
      'Controller.cs',
      'server.go',
      'lib.rs',
      'view.vue',
      'Widget.svelte',
      'page.astro',
      'theme.scss',
      'schema.graphql',
      'events.proto',
      'infra.tf',
      'build.gradle',
    ];

    for (const [index, name] of supportedNames.entries()) {
      const result = await normalizeUploadedTextSourceFile(
        createFakeFile({ name, text: `evidence ${index}` }),
        { id: `source-${index + 1}`, maxBytes: 512 * 1024 },
      );

      expect(result.item).toEqual(expect.objectContaining({
        label: name,
        text: `evidence ${index}`,
      }));
      expect(result.manifest).toEqual(expect.objectContaining({
        label: name,
        included: true,
        warnings: [],
      }));
      expect(result.manifest).not.toHaveProperty('text');
    }
  });

  it('supports safe extensionless and dotfile developer text filenames', async () => {
    const supportedNames = [
      'Dockerfile',
      'Makefile',
      'Procfile',
      'LICENSE',
      'README',
      '.gitignore',
      '.dockerignore',
      '.env.example',
      'bundle.zip / Dockerfile',
    ];

    for (const [index, name] of supportedNames.entries()) {
      expect(isSupportedTextSourceFileName(name)).toBe(true);

      const result = await normalizeUploadedTextSourceFile(
        createFakeFile({ name, text: `safe filename ${index}` }),
        { id: `source-${index + 1}`, maxBytes: 512 * 1024 },
      );

      expect(result.item).toEqual(expect.objectContaining({
        label: name,
        mediaType: 'text/plain',
        text: `safe filename ${index}`,
      }));
      expect(result.warnings).toEqual([]);
    }
  });

  it('uses the final path segment when checking zip entry labels', () => {
    expect(getSourceFileExtension('bundle.zip / src/App.tsx')).toBe('.tsx');
    expect(getSourceFileExtension('bundle.zip / Dockerfile')).toBe('');
    expect(isSupportedTextSourceFileName('bundle.zip / Dockerfile')).toBe(true);
  });

  it('rejects secret-like, binary dump, and generated bundle names before decoding', async () => {
    const disallowedNames = [
      '.env',
      '.env.local',
      'private.key',
      'database.sqlite',
      'app.min.js',
      'client.bundle.css',
      'types.generated.ts',
    ];

    for (const [index, name] of disallowedNames.entries()) {
      const result = await normalizeUploadedTextSourceFile(
        createFakeFile({ name, text: `should not decode ${index}` }),
        { id: `source-${index + 1}`, maxBytes: 512 * 1024 },
      );

      expect(result.item).toBeNull();
      expect(result.manifest).toEqual(expect.objectContaining({
        label: name,
        included: false,
        warnings: [expect.stringContaining(`Source file "${name}" is not allowed`)],
      }));
      expect(result.warnings).toEqual([`Skipped disallowed source file "${name}".`]);
    }
  });

  it('normalizes named byte sources without requiring browser file objects', async () => {
    const bytes = encoder.encode('export const fromRepo = true;');

    const result = await normalizeNamedTextSourceBytes({
      id: 'source-1',
      kind: 'github-file',
      label: 'owner/repo:src/App.ts',
      bytes: bytes.byteLength,
      readBytes: async () => bytes,
      maxBytes: 512 * 1024,
    });

    expect(result).toEqual({
      item: expect.objectContaining({
        id: 'source-1',
        kind: 'github-file',
        label: 'owner/repo:src/App.ts',
        mediaType: 'text/typescript',
        bytes: bytes.byteLength,
        text: 'export const fromRepo = true;',
      }),
      manifest: {
        id: 'source-1',
        kind: 'github-file',
        label: 'owner/repo:src/App.ts',
        mediaType: 'text/typescript',
        bytes: bytes.byteLength,
        included: true,
        warnings: [],
      },
      warnings: [],
    });
    expect(result.manifest).not.toHaveProperty('text');
  });
});
