import { describe, expect, it } from 'vitest';

import {
  createProjectAgentSourceBundle,
  PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_FILE_MAX_COUNT,
  PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
  PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH,
} from '../../../../server/admin/agent/sourceBundle.js';

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

describe('project agent source bundle helpers', () => {
  it('normalizes pasted source text without putting raw text in the manifest', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: '  Portfolio source notes.  ',
    });

    expect(bundle).toEqual({
      hasSourceContext: true,
      sources: [
        expect.objectContaining({
          id: 'source-1',
          kind: 'pasted-text',
          label: 'Pasted source material',
          mediaType: 'text/plain',
          bytes: 23,
          text: 'Portfolio source notes.',
        }),
      ],
      manifest: [
        {
          id: 'source-1',
          kind: 'pasted-text',
          label: 'Pasted source material',
          mediaType: 'text/plain',
          bytes: 23,
          included: true,
          warnings: [],
        },
      ],
      warnings: [],
    });
    expect(bundle.manifest[0]).not.toHaveProperty('text');
  });

  it('normalizes multiple valid text-like source files', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({ name: 'report.md', text: '# Report', type: 'text/markdown' }),
        createFakeFile({ name: 'metrics.csv', text: 'name,value\nwins,3', type: 'text/csv' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'report.md',
        mediaType: 'text/markdown',
        text: '# Report',
      }),
      expect.objectContaining({
        id: 'source-2',
        kind: 'file',
        label: 'metrics.csv',
        mediaType: 'text/csv',
        text: 'name,value\nwins,3',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'report.md',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-2',
        label: 'metrics.csv',
        included: true,
        warnings: [],
      }),
    ]);
  });

  it('keeps usable source files when adjacent uploads are skipped', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({ name: 'report.md', text: '# Report', type: 'text/markdown' }),
        createFakeFile({ name: 'screenshot.png', text: 'not really an image', type: 'image/png' }),
        createFakeFile({ name: 'blank.txt', text: '   ' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'report.md',
        text: '# Report',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'report.md',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-2',
        label: 'screenshot.png',
        included: false,
        warnings: ['Unsupported source file type for "screenshot.png".'],
      }),
      expect.objectContaining({
        id: 'source-3',
        label: 'blank.txt',
        included: false,
        warnings: ['Source file "blank.txt" is empty after trimming.'],
      }),
    ]);
    expect(bundle.warnings).toEqual([
      'Skipped unsupported source file "screenshot.png".',
      'Skipped empty source file "blank.txt".',
    ]);
  });

  it('ignores empty pasted source and empty files with manifest warnings', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: '   ',
      sourceFiles: [
        createFakeFile({ name: 'empty.txt', text: '' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(false);
    expect(bundle.sources).toEqual([]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'empty.txt',
        included: false,
        warnings: ['Source file "empty.txt" is empty.'],
      }),
    ]);
    expect(bundle.warnings).toEqual(['Skipped empty source file "empty.txt".']);
  });

  it('skips unsupported source file extensions deterministically', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({ name: 'screenshot.png', text: 'not really an image', type: 'image/png' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(false);
    expect(bundle.sources).toEqual([]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'screenshot.png',
        included: false,
        warnings: ['Unsupported source file type for "screenshot.png".'],
      }),
    ]);
    expect(bundle.warnings).toEqual(['Skipped unsupported source file "screenshot.png".']);
  });

  it('skips oversized source files with manifest warnings', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({
          name: 'huge.log',
          bytes: new Uint8Array(PROJECT_AGENT_SOURCE_FILE_MAX_BYTES + 1),
        }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(false);
    expect(bundle.sources).toEqual([]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'huge.log',
        bytes: PROJECT_AGENT_SOURCE_FILE_MAX_BYTES + 1,
        included: false,
        warnings: [`Source file "huge.log" exceeds the ${PROJECT_AGENT_SOURCE_FILE_MAX_BYTES} byte limit.`],
      }),
    ]);
    expect(bundle.warnings).toEqual(['Skipped oversized source file "huge.log".']);
  });

  it('skips files that cannot be decoded as UTF-8', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({
          name: 'broken.log',
          bytes: new Uint8Array([0xff, 0xff]),
        }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(false);
    expect(bundle.sources).toEqual([]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'broken.log',
        included: false,
        warnings: ['Source file "broken.log" could not be decoded as UTF-8.'],
      }),
    ]);
    expect(bundle.warnings).toEqual(['Skipped undecodable source file "broken.log".']);
  });

  it('truncates pasted source at the pasted text limit', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'x'.repeat(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH + 10),
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources[0].text).toHaveLength(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH);
    expect(bundle.manifest[0].warnings).toEqual([
      `Truncated pasted source material to ${PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH} characters.`,
    ]);
    expect(bundle.warnings).toEqual([
      `Truncated pasted source material to ${PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH} characters.`,
    ]);
  });

  it('truncates later source files at the total source text limit', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'p'.repeat(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
      sourceFiles: [
        createFakeFile({
          name: 'long.md',
          text: 'f'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH),
          type: 'text/markdown',
        }),
      ],
    });

    expect(bundle.sources).toHaveLength(2);
    expect(bundle.sources[0].text).toHaveLength(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH);
    expect(bundle.sources[1].text).toHaveLength(
      PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH - PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
    );
    expect(bundle.manifest[1].warnings).toEqual([
      `Truncated source "long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
    ]);
    expect(bundle.warnings).toEqual([
      `Truncated source "long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
    ]);
  });

  it('skips files beyond the configured source file count', async () => {
    const sourceFiles = Array.from({ length: PROJECT_AGENT_SOURCE_FILE_MAX_COUNT + 2 }, (_, index) => createFakeFile({
      name: `source-${index + 1}.txt`,
      text: `Source ${index + 1}`,
    }));

    const bundle = await createProjectAgentSourceBundle({ sourceFiles });

    expect(bundle.sources).toHaveLength(PROJECT_AGENT_SOURCE_FILE_MAX_COUNT);
    expect(bundle.manifest).toHaveLength(PROJECT_AGENT_SOURCE_FILE_MAX_COUNT);
    expect(bundle.warnings).toEqual([
      `Skipped 2 source file(s) beyond the ${PROJECT_AGENT_SOURCE_FILE_MAX_COUNT} file limit.`,
    ]);
  });
});
