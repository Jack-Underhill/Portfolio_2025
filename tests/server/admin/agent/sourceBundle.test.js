import { Buffer } from 'node:buffer';

import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';

import {
  createProjectAgentSourceBundle,
  PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_FILE_MAX_COUNT,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
  PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH,
} from '../../../../server/admin/agent/sourceBundle.js';
import { createPdfBuffer } from './sourceIngestion/pdfTestFixture.js';
import {
  createLargeRepoFetchFixture,
  LARGE_REPO_INCLUDED_TEXT,
  LARGE_REPO_SKIPPED_PATH_COUNT,
  LARGE_REPO_URL,
} from './sourceIngestion/githubLargeRepoFixture.js';

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

async function createZipBytes(entries) {
  const zip = new JSZip();

  entries.forEach(({ path, text, bytes }) => {
    zip.file(path, bytes || text || '');
  });

  return new Uint8Array(await zip.generateAsync({ type: 'uint8array' }));
}

function createHeaders(values = {}) {
  const normalized = new Map(
    Object.entries(values).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    get(name) {
      return normalized.get(String(name).toLowerCase()) ?? null;
    },
  };
}

function createJsonResponse(data, { status = 200, headers } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: createHeaders(headers),
    json: async () => data,
  };
}

function createGitHubBlob(text) {
  const bytes = encoder.encode(text);

  return {
    encoding: 'base64',
    content: Buffer.from(bytes).toString('base64'),
    size: bytes.byteLength,
  };
}

function createRouteFetch(routes) {
  return vi.fn(async (url) => {
    const route = routes[url];

    if (!route) throw new Error(`Unexpected fetch: ${url}`);
    return route;
  });
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

  it('normalizes multiple valid curated text/code source files', async () => {
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

  it('normalizes expanded text and code source file extensions', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({ name: 'App.jsx', text: 'export function App() {}', type: '' }),
        createFakeFile({ name: 'schema.sql', text: 'select 1;', type: '' }),
        createFakeFile({ name: 'config.yaml', text: 'name: portfolio', type: '' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'App.jsx',
        mediaType: 'text/javascript',
        text: 'export function App() {}',
      }),
      expect.objectContaining({
        id: 'source-2',
        kind: 'file',
        label: 'schema.sql',
        mediaType: 'application/sql',
        text: 'select 1;',
      }),
      expect.objectContaining({
        id: 'source-3',
        kind: 'file',
        label: 'config.yaml',
        mediaType: 'application/yaml',
        text: 'name: portfolio',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'App.jsx',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-2',
        label: 'schema.sql',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-3',
        label: 'config.yaml',
        included: true,
        warnings: [],
      }),
    ]);
  });

  it('normalizes direct PDF source files with metadata-only manifests', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({
          name: 'case-study.pdf',
          bytes: createPdfBuffer('PDF bundle source evidence'),
          type: 'application/pdf',
        }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'pdf',
        label: 'case-study.pdf',
        mediaType: 'application/pdf',
        text: '[PDF: case-study.pdf]\n[Page 1]\nPDF bundle source evidence',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'pdf',
        label: 'case-study.pdf',
        mediaType: 'application/pdf',
        included: true,
        warnings: [],
        pages: 1,
      }),
    ]);
    expect(bundle.manifest[0]).not.toHaveProperty('text');
    expect(bundle.warnings).toEqual([]);
  });

  it('normalizes direct zip source files into multiple metadata-only manifest entries', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({
          name: 'bundle.zip',
          type: 'application/zip',
          bytes: await createZipBytes([
            { path: 'docs/notes.md', text: '# Bundle notes' },
            { path: 'docs/report.pdf', bytes: createPdfBuffer('PDF evidence from zip') },
            { path: 'z-assets/logo.png', bytes: new Uint8Array([1, 2, 3]) },
          ]),
        }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'bundle.zip / docs/notes.md',
        text: '# Bundle notes',
      }),
      expect.objectContaining({
        id: 'source-2',
        kind: 'pdf',
        label: 'bundle.zip / docs/report.pdf',
        text: '[PDF: bundle.zip / docs/report.pdf]\n[Page 1]\nPDF evidence from zip',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'bundle.zip / docs/notes.md',
        included: true,
        archiveLabel: 'bundle.zip',
        path: 'docs/notes.md',
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-2',
        kind: 'pdf',
        label: 'bundle.zip / docs/report.pdf',
        included: true,
        archiveLabel: 'bundle.zip',
        path: 'docs/report.pdf',
        pages: 1,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-3',
        kind: 'zip-entry',
        label: 'bundle.zip / z-assets/logo.png',
        included: false,
        archiveLabel: 'bundle.zip',
        path: 'z-assets/logo.png',
        warnings: ['Skipped unsupported zip entry "bundle.zip / z-assets/logo.png".'],
      }),
    ]);
    bundle.manifest.forEach((entry) => {
      expect(entry).not.toHaveProperty('text');
    });
    expect(bundle.warnings).toEqual([
      'Skipped unsupported zip entry "bundle.zip / z-assets/logo.png".',
    ]);
  });

  it('normalizes GitHub repository sources in the shared bundle flow', async () => {
    const githubFetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'README.md', type: 'blob', sha: 'aaaaaa', size: 13 },
          { path: 'src/App.jsx', type: 'blob', sha: 'bbbbbb', size: 24 },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(createGitHubBlob('# Repo notes')),
      'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb': createJsonResponse(createGitHubBlob('export function App() {}')),
    });

    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'Owner source note.',
      sourceFiles: [
        createFakeFile({ name: 'local.md', text: '# Local note', type: 'text/markdown' }),
      ],
      githubRepoUrl: 'https://github.com/owner/repo',
      githubFetchImpl,
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'pasted-text',
        label: 'Pasted source material',
        text: 'Owner source note.',
      }),
      expect.objectContaining({
        id: 'source-2',
        kind: 'file',
        label: 'local.md',
        text: '# Local note',
      }),
      expect.objectContaining({
        id: 'source-3',
        kind: 'github-file',
        label: 'owner/repo / README.md',
        repo: 'owner/repo',
        ref: 'main',
        path: 'README.md',
        text: '# Repo notes',
      }),
      expect.objectContaining({
        id: 'source-4',
        kind: 'github-file',
        label: 'owner/repo / src/App.jsx',
        repo: 'owner/repo',
        ref: 'main',
        path: 'src/App.jsx',
        text: 'export function App() {}',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        included: true,
        label: 'Pasted source material',
      }),
      expect.objectContaining({
        id: 'source-2',
        included: true,
        label: 'local.md',
      }),
      expect.objectContaining({
        id: 'source-3',
        kind: 'github-file',
        label: 'owner/repo / README.md',
        repo: 'owner/repo',
        owner: 'owner',
        ref: 'main',
        path: 'README.md',
        sourceUrl: 'https://github.com/owner/repo/blob/main/README.md',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-4',
        kind: 'github-file',
        label: 'owner/repo / src/App.jsx',
        path: 'src/App.jsx',
        included: true,
      }),
    ]);
    bundle.manifest.forEach((entry) => {
      expect(entry).not.toHaveProperty('text');
    });
    expect(JSON.stringify(bundle.manifest)).not.toContain('export function App');
    expect(bundle.warnings).toEqual([]);
  });

  it('returns clear metadata-only GitHub warnings for unsupported repository URLs', async () => {
    const githubFetchImpl = vi.fn();

    const bundle = await createProjectAgentSourceBundle({
      githubRepoUrl: 'https://github.com/owner/repo/issues/1',
      githubFetchImpl,
    });

    expect(githubFetchImpl).not.toHaveBeenCalled();
    expect(bundle).toEqual({
      hasSourceContext: false,
      sources: [],
      manifest: [
        expect.objectContaining({
          id: 'source-1',
          kind: 'github-repo',
          label: 'https://github.com/owner/repo/issues/1',
          included: false,
          warnings: ['GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.'],
        }),
      ],
      warnings: ['GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.'],
    });
    expect(bundle.manifest[0]).not.toHaveProperty('text');
  });

  it('applies the shared total source text limit to GitHub files after earlier sources', async () => {
    const githubFetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'long.md', type: 'blob', sha: 'aaaaaa', size: PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(
        createGitHubBlob('g'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH)),
      ),
    });

    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'p'.repeat(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
      githubRepoUrl: 'https://github.com/owner/repo',
      githubFetchImpl,
    });

    expect(bundle.sources).toHaveLength(2);
    expect(bundle.sources[1]).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'owner/repo / long.md',
      text: 'g'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH - PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
    }));
    expect(bundle.manifest[1]).toEqual(expect.objectContaining({
      id: 'source-2',
      included: true,
      warnings: [
        `Truncated source "owner/repo / long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
      ],
    }));
    expect(bundle.warnings).toEqual([
      `Truncated source "owner/repo / long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
    ]);
  });

  it('characterizes large repo bundles as usable source context with excessive skipped warnings', async () => {
    const { fetchImpl } = createLargeRepoFetchFixture();

    const bundle = await createProjectAgentSourceBundle({
      githubRepoUrl: LARGE_REPO_URL,
      githubFetchImpl: fetchImpl,
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources.map((source) => source.path)).toEqual(expect.arrayContaining([
      'README.md',
      'src/App.jsx',
    ]));
    expect(bundle.sources).toHaveLength(2);
    expect(bundle.manifest).toHaveLength(2 + LARGE_REPO_SKIPPED_PATH_COUNT);
    expect(bundle.manifest.filter((entry) => entry.included)).toHaveLength(2);
    expect(bundle.warnings).toHaveLength(LARGE_REPO_SKIPPED_PATH_COUNT);
    expect(bundle.warnings.length).toBeGreaterThan(25);
    expect(JSON.stringify(bundle.manifest)).not.toContain(LARGE_REPO_INCLUDED_TEXT['README.md']);
    expect(JSON.stringify(bundle.manifest)).not.toContain(LARGE_REPO_INCLUDED_TEXT['src/App.jsx']);
  });

  it('extracts markdown and code cells from direct notebook files', async () => {
    const notebook = JSON.stringify({
      cells: [
        { cell_type: 'markdown', source: ['# Findings\n', 'Notebook notes.'] },
        { cell_type: 'code', source: 'print("hello")' },
        { cell_type: 'raw', source: 'ignored raw cell' },
      ],
    });

    const bundle = await createProjectAgentSourceBundle({
      sourceFiles: [
        createFakeFile({ name: 'analysis.ipynb', text: notebook, type: '' }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toEqual([
      expect.objectContaining({
        id: 'source-1',
        kind: 'file',
        label: 'analysis.ipynb',
        mediaType: 'application/x-ipynb+json',
        text: '[Markdown cell 1]\n# Findings\nNotebook notes.\n\n[Code cell 2]\nprint("hello")',
      }),
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'analysis.ipynb',
        included: true,
        warnings: [],
      }),
    ]);
    expect(bundle.manifest[0]).not.toHaveProperty('text');
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

  it('truncates zip entry source text at the total source text limit', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'p'.repeat(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
      sourceFiles: [
        createFakeFile({
          name: 'bundle.zip',
          type: 'application/zip',
          bytes: await createZipBytes([
            {
              path: 'long.md',
              text: 'z'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH),
            },
          ]),
        }),
      ],
    });

    expect(bundle.sources).toHaveLength(2);
    expect(bundle.sources[1]).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'bundle.zip / long.md',
      text: 'z'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH - PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
    }));
    expect(bundle.manifest[1]).toEqual(expect.objectContaining({
      id: 'source-2',
      label: 'bundle.zip / long.md',
      included: true,
      warnings: [
        `Truncated source "bundle.zip / long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
      ],
    }));
    expect(bundle.warnings).toEqual([
      `Truncated source "bundle.zip / long.md" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`,
    ]);
  });

  it('skips later source files when the total source text limit is already exhausted', async () => {
    const bundle = await createProjectAgentSourceBundle({
      sourceText: 'p'.repeat(PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
      sourceFiles: [
        createFakeFile({
          name: 'fills-remaining.md',
          text: 'f'.repeat(PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH - PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH),
          type: 'text/markdown',
        }),
        createFakeFile({
          name: 'later.md',
          text: 'late source text must not be included',
          type: 'text/markdown',
        }),
      ],
    });

    expect(bundle.hasSourceContext).toBe(true);
    expect(bundle.sources).toHaveLength(2);
    expect(bundle.sources.map((source) => source.label)).toEqual([
      'Pasted source material',
      'fills-remaining.md',
    ]);
    expect(bundle.manifest).toEqual([
      expect.objectContaining({
        id: 'source-1',
        label: 'Pasted source material',
        included: true,
      }),
      expect.objectContaining({
        id: 'source-2',
        label: 'fills-remaining.md',
        included: true,
        warnings: [],
      }),
      expect.objectContaining({
        id: 'source-3',
        label: 'later.md',
        included: false,
        warnings: [
          'Skipped source "later.md" because the total source text limit was reached.',
        ],
      }),
    ]);
    bundle.manifest.forEach((entry) => {
      expect(entry).not.toHaveProperty('text');
    });
    expect(JSON.stringify(bundle.manifest)).not.toContain('late source text must not be included');
    expect(bundle.warnings).toEqual([
      'Skipped source "later.md" because the total source text limit was reached.',
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

  it('exports the configured GitHub included file limit for downstream schema bounds', () => {
    expect(PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES).toBe(40);
  });
});
