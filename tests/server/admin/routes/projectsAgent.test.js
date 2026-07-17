import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';

import { ProjectAgentRunError, runProjectAgent } from '../../../../server/admin/agent/projectAgentRun.js';
import { createProjectAgentSourceBundle } from '../../../../server/admin/agent/sourceBundle.js';
import {
  createProjectsAgentRunHandler,
  createProjectsAgentSourcePreviewHandler,
  createProjectsAgentRuntimeHandler,
} from '../../../../server/admin/routes/projectsAgent.js';
import {
  createLargeRepoFetchFixture,
  LARGE_REPO_INCLUDED_TEXT,
  LARGE_REPO_SKIPPED_PATH_COUNT,
  LARGE_REPO_URL,
} from '../agent/sourceIngestion/githubLargeRepoFixture.js';
import { createPdfBuffer } from '../agent/sourceIngestion/pdfTestFixture.js';

const validPayload = {
  intent: 'revise',
  instructions: 'Tighten the overview.',
  projectContext: {
    projectContext: {
      id: 42,
      title: 'Current title',
      permalink: 'current-title',
      projectType: 'personal',
      labels: ['Portfolio'],
    },
    draft: {
      title: 'Current title',
      description: 'Current card copy',
    },
  },
};

describe('projects agent run route', () => {
  it('delegates JSON requests to the project agent run helper', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload).toEqual(validPayload);

      return {
        patch: { title: 'Revised title' },
        notes: ['Updated the title.'],
        warnings: [],
        appliedFields: ['title'],
        intent: 'revise',
        runPlan: 'revise-current-case-study',
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload);
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      patch: { title: 'Revised title' },
      notes: ['Updated the title.'],
      warnings: [],
      appliedFields: ['title'],
      intent: 'revise',
      runPlan: 'revise-current-case-study',
      elapsedMs: 25,
    });
  });

  it('requires JSON or multipart requests before invoking Codex', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn();
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload, 'text/plain');
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Project agent run requests must use application/json or multipart/form-data.',
    });

    warn.mockRestore();
  });

  it('normalizes pasted source text from JSON requests before invoking Codex', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload).toEqual({
        ...validPayload,
        intent: 'review',
        sourceBundle: {
          hasSourceContext: true,
          sources: [
            expect.objectContaining({
              id: 'source-1',
              kind: 'pasted-text',
              label: 'Pasted source material',
              text: 'Launch notes and outcome metrics.',
            }),
          ],
          manifest: [
            expect.objectContaining({
              id: 'source-1',
              included: true,
              label: 'Pasted source material',
            }),
          ],
          warnings: [],
        },
      });

      return {
        patch: {},
        notes: ['Reviewed against pasted source.'],
        warnings: [],
        appliedFields: [],
        intent: 'review',
        runPlan: 'review-with-source-context',
        sourceManifest: [],
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest({
      ...validPayload,
      intent: 'review',
      sourceText: '  Launch notes and outcome metrics.  ',
    });
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('ignores blank pasted source when no files are provided', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload).toEqual(validPayload);

      return {
        patch: {},
        notes: [],
        warnings: [],
        appliedFields: [],
        intent: 'revise',
        runPlan: 'revise-current-case-study',
        sourceManifest: [],
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest({
      ...validPayload,
      sourceText: '   ',
    });
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('normalizes source files from multipart requests before invoking Codex', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload.sourceBundle).toEqual({
        hasSourceContext: true,
        sources: [
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
        ],
        manifest: [
          expect.objectContaining({
            id: 'source-1',
            label: 'report.md',
            included: true,
          }),
          expect.objectContaining({
            id: 'source-2',
            label: 'metrics.csv',
            included: true,
          }),
        ],
        warnings: [],
      });

      return {
        patch: { title: 'Revised title' },
        notes: ['Updated the title.'],
        warnings: [],
        appliedFields: ['title'],
        intent: 'revise',
        runPlan: 'revise-with-source-context',
        sourceManifest: [],
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = multipartRequest(validPayload, [
      ['sourceFiles', new Blob(['# Report'], { type: 'text/markdown' }), 'report.md'],
      ['sourceFiles', new Blob(['name,value\nwins,3'], { type: 'text/csv' }), 'metrics.csv'],
    ]);
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('normalizes mixed pasted and file source from multipart requests', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload.sourceBundle.sources).toEqual([
        expect.objectContaining({
          id: 'source-1',
          kind: 'pasted-text',
          text: 'Owner source note.',
        }),
        expect.objectContaining({
          id: 'source-2',
          kind: 'file',
          label: 'release.log',
          text: 'Released v1.',
        }),
      ]);

      return {
        patch: { description: 'Revised card copy' },
        notes: ['Updated the description.'],
        warnings: [],
        appliedFields: ['description'],
        intent: 'revise',
        runPlan: 'revise-with-source-context',
        sourceManifest: [],
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = multipartRequest({
      ...validPayload,
      sourceText: 'Owner source note.',
    }, [
      ['sourceFiles', new Blob(['Released v1.'], { type: 'text/plain' }), 'release.log'],
    ]);
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('builds a source bundle for repo-only run requests', async () => {
    const sourceBundle = {
      hasSourceContext: true,
      sources: [
        {
          id: 'source-1',
          kind: 'github-file',
          label: 'owner/repo / README.md',
          mediaType: 'text/markdown',
          bytes: 12,
          text: '# Repo notes',
        },
      ],
      manifest: [
        {
          id: 'source-1',
          kind: 'github-file',
          label: 'owner/repo / README.md',
          mediaType: 'text/markdown',
          bytes: 12,
          included: true,
          warnings: [],
          repo: 'owner/repo',
          owner: 'owner',
          ref: 'main',
          path: 'README.md',
          sourceUrl: 'https://github.com/owner/repo/blob/main/README.md',
        },
      ],
      warnings: [],
    };
    const createSourceBundle = vi.fn(async (input) => {
      expect(input).toEqual({
        sourceText: undefined,
        sourceFiles: [],
        githubRepoUrl: 'https://github.com/owner/repo',
      });
      return sourceBundle;
    });
    const runAgent = vi.fn(async (payload) => {
      expect(payload).toEqual({
        ...validPayload,
        instructions: ' ',
        sourceBundle,
      });

      return {
        patch: { description: 'Revised with repo evidence' },
        notes: ['Updated from repo evidence.'],
        warnings: [],
        appliedFields: ['description'],
        intent: 'revise',
        runPlan: 'revise-with-source-context',
        sourceManifest: sourceBundle.manifest,
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent, createSourceBundle });
    const req = jsonRequest({
      ...validPayload,
      instructions: ' ',
      githubRepoUrl: 'https://github.com/owner/repo',
    });
    const res = mockResponse();

    await handler(req, res);

    expect(createSourceBundle).toHaveBeenCalledTimes(1);
    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('characterizes large repo run denial as source warning cardinality after usable bundle creation', async () => {
    const { fetchImpl } = createLargeRepoFetchFixture();
    const createSourceBundle = (input) => createProjectAgentSourceBundle({
      ...input,
      githubFetchImpl: fetchImpl,
    });
    const runAgent = (payload) => runProjectAgent({
      ...payload,
      commandResolver: () => 'codex',
      codexBridge: async () => {
        throw new Error('Codex bridge should not run when sourceBundle warnings exceed schema bounds.');
      },
    });
    const handler = createProjectsAgentRunHandler({ runAgent, createSourceBundle });
    const req = jsonRequest({
      ...validPayload,
      instructions: ' ',
      githubRepoUrl: LARGE_REPO_URL,
    });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'sourceBundle warnings must contain 25 or fewer items.',
      details: {
        type: 'invalid_input',
        message: 'sourceBundle warnings must contain 25 or fewer items.',
      },
    });
  });

  it('passes unsupported source uploads as skipped source bundle warnings', async () => {
    const runAgent = vi.fn(async (payload) => {
      expect(payload).toEqual({
        ...validPayload,
        sourceBundle: {
          hasSourceContext: false,
          sources: [],
          manifest: [
            expect.objectContaining({
              id: 'source-1',
              kind: 'file',
              label: 'screenshot.png',
              included: false,
              warnings: ['Unsupported source file type for "screenshot.png".'],
            }),
          ],
          warnings: ['Skipped unsupported source file "screenshot.png".'],
        },
      });

      return {
        patch: {},
        notes: ['No usable source was included.'],
        warnings: ['Skipped unsupported source file "screenshot.png".'],
        appliedFields: [],
        intent: 'revise',
        runPlan: 'revise-current-case-study',
        sourceManifest: [],
        elapsedMs: 25,
      };
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = multipartRequest(validPayload, [
      ['sourceFiles', new Blob(['not an image'], { type: 'image/png' }), 'screenshot.png'],
    ]);
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('returns concise 400 responses for multipart parse errors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn();
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = Readable.from([Buffer.from('not multipart data')]);
    req.headers = {
      'content-type': 'multipart/form-data; boundary=broken',
      'content-length': Buffer.byteLength('not multipart data'),
    };
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Admin multipart request could not be parsed',
    });

    warn.mockRestore();
  });

  it('returns concise 400 responses for invalid project agent input', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'invalid_input',
        'Project agent instructions or source material are required.',
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest({ ...validPayload, instructions: ' ' });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Project agent instructions or source material are required.',
      details: {
        type: 'invalid_input',
        message: 'Project agent instructions or source material are required.',
      },
    });

    warn.mockRestore();
  });

  it('returns concise 400 responses for unsupported project agent intents', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'invalid_intent',
        'Unsupported project agent intent. Supported intents: revise, review.',
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest({ ...validPayload, intent: 'polish' });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Unsupported project agent intent. Supported intents: revise, review.',
      details: {
        type: 'invalid_intent',
        message: 'Unsupported project agent intent. Supported intents: revise, review.',
      },
    });

    warn.mockRestore();
  });

  it('returns concise 500 responses for invalid Codex output', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'invalid_patch',
        'features must be an array.',
        {
          runPlan: 'revise-with-source-context',
          intent: 'revise',
          hasSourceContext: true,
          sourceCount: 1,
          sourceWarningCount: 0,
          stdout: 'raw output should not be returned',
        },
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload);
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: 'Local Codex returned an invalid project patch.',
      details: {
        type: 'invalid_patch',
        message: 'features must be an array.',
        runPlan: 'revise-with-source-context',
        intent: 'revise',
        hasSourceContext: true,
        sourceCount: 1,
        sourceWarningCount: 0,
      },
    });
    expect(JSON.stringify(res.json())).not.toContain('raw output should not be returned');

    error.mockRestore();
  });

  it('returns concise 500 responses for malformed Codex wrapper output', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'malformed_wrapper',
        'Project agent output patch must be an object.',
        { stdout: 'raw output should not be returned' },
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload);
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: 'Local Codex returned an invalid response shape.',
      details: {
        type: 'malformed_wrapper',
        message: 'Project agent output patch must be an object.',
      },
    });

    error.mockRestore();
  });

  it('returns concise bridge failures without raw diagnostics', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'bridge_failure',
        'Local Codex run failed: Command timed out after 120000 ms.',
        {
          bridgeType: 'timeout',
          elapsedMs: 120000,
          stderr: 'raw stderr should not be returned',
        },
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload);
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: 'Local Codex run failed: Command timed out after 120000 ms.',
      details: {
        type: 'bridge_failure',
        message: 'Local Codex run failed: Command timed out after 120000 ms.',
        bridgeType: 'timeout',
        elapsedMs: 120000,
      },
    });
    expect(JSON.stringify(res.json())).not.toContain('raw stderr should not be returned');

    error.mockRestore();
  });
});

describe('projects agent runtime route', () => {
  it('returns explicit Codex runtime metadata from the server helper', () => {
    const metadata = {
      model: 'gpt-5.5',
      modelReasoningEffort: 'high',
      modelLabel: 'gpt-5.5',
      modelSource: 'user-config',
      modelSourceLabel: 'Codex user config',
      isModelExplicit: true,
    };
    const getRuntimeMetadata = vi.fn(() => metadata);
    const handler = createProjectsAgentRuntimeHandler({ getRuntimeMetadata });
    const res = mockResponse();

    handler({}, res);

    expect(getRuntimeMetadata).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(metadata);
  });

  it('returns fallback Codex runtime metadata as a successful response', () => {
    const metadata = {
      model: null,
      modelReasoningEffort: null,
      modelLabel: 'Codex default',
      modelSource: 'default',
      modelSourceLabel: 'Codex built-in default',
      isModelExplicit: false,
    };
    const handler = createProjectsAgentRuntimeHandler({
      getRuntimeMetadata: () => metadata,
    });
    const res = mockResponse();

    handler({}, res);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(metadata);
  });

  it('returns a concise route error when runtime metadata loading throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = createProjectsAgentRuntimeHandler({
      getRuntimeMetadata: () => {
        throw new Error('raw config diagnostics should not be returned');
      },
    });
    const res = mockResponse();

    handler({}, res);

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: 'Project agent runtime metadata could not be loaded.',
    });

    error.mockRestore();
  });
});

describe('projects agent source preview route', () => {
  it('previews pasted source text without returning raw source text', async () => {
    const handler = createProjectsAgentSourcePreviewHandler();
    const req = jsonRequest({
      sourceText: '  Launch notes and outcome metrics.  ',
    });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expect.objectContaining({
      hasSourceContext: true,
      manifest: [
        expect.objectContaining({
          id: 'source-1',
          kind: 'pasted-text',
          label: 'Pasted source material',
          included: true,
          warnings: [],
        }),
      ],
      warnings: [],
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 0,
      limits: expect.objectContaining({
        fileMaxCount: expect.any(Number),
        pdfMaxBytes: expect.any(Number),
        zipMaxBytes: expect.any(Number),
      }),
    }));
    expect(JSON.stringify(res.json())).not.toContain('Launch notes and outcome metrics');
    expect(res.json()).not.toHaveProperty('sources');
  });

  it('previews multipart zip and unsupported source files with metadata-only manifests', async () => {
    const handler = createProjectsAgentSourcePreviewHandler();
    const zipBytes = await createZipBuffer([
      { path: 'docs/notes.md', text: '# Notes' },
      { path: 'assets/logo.png', bytes: new Uint8Array([1, 2, 3]) },
    ]);
    const req = multipartRequest({
      sourceText: 'Owner source note.',
    }, [
      ['sourceFiles', new Blob([zipBytes], { type: 'application/zip' }), 'bundle.zip'],
      ['sourceFiles', new Blob([createPdfBuffer('PDF preview evidence')], {
        type: 'application/pdf',
      }), 'report.pdf'],
      ['sourceFiles', new Blob(['not an image'], { type: 'image/png' }), 'screenshot.png'],
    ]);
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expect.objectContaining({
      hasSourceContext: true,
      sourceCount: 3,
      manifestCount: 5,
      warningCount: 2,
      manifest: [
        expect.objectContaining({
          id: 'source-1',
          kind: 'pasted-text',
          label: 'Pasted source material',
          included: true,
        }),
        expect.objectContaining({
          id: 'source-2',
          label: 'bundle.zip / assets/logo.png',
          included: false,
          warnings: ['Skipped unsupported zip entry "bundle.zip / assets/logo.png".'],
        }),
        expect.objectContaining({
          id: 'source-3',
          kind: 'file',
          label: 'bundle.zip / docs/notes.md',
          archiveLabel: 'bundle.zip',
          path: 'docs/notes.md',
          included: true,
          warnings: [],
        }),
        expect.objectContaining({
          id: 'source-4',
          kind: 'pdf',
          label: 'report.pdf',
          included: true,
          pages: 1,
          warnings: [],
        }),
        expect.objectContaining({
          id: 'source-5',
          kind: 'file',
          label: 'screenshot.png',
          included: false,
          warnings: ['Unsupported source file type for "screenshot.png".'],
        }),
      ],
      warnings: [
        'Skipped unsupported zip entry "bundle.zip / assets/logo.png".',
        'Skipped unsupported source file "screenshot.png".',
      ],
    }));
    expect(JSON.stringify(res.json())).not.toContain('# Notes');
    expect(JSON.stringify(res.json())).not.toContain('PDF preview evidence');
    expect(JSON.stringify(res.json())).not.toContain('Owner source note.');
    expect(res.json()).not.toHaveProperty('sources');
  });

  it('previews GitHub repository URL context through the source bundle helper', async () => {
    const createSourceBundle = vi.fn(async (input) => {
      expect(input).toEqual({
        sourceText: undefined,
        sourceFiles: [],
        githubRepoUrl: 'https://github.com/owner/repo',
      });

      return {
        hasSourceContext: true,
        sources: [
          {
            id: 'source-1',
            kind: 'github-file',
            label: 'owner/repo / README.md',
            mediaType: 'text/markdown',
            bytes: 12,
            text: '# Repo notes',
          },
        ],
        manifest: [
          {
            id: 'source-1',
            kind: 'github-file',
            label: 'owner/repo / README.md',
            mediaType: 'text/markdown',
            bytes: 12,
            included: true,
            warnings: [],
            repo: 'owner/repo',
            owner: 'owner',
            ref: 'main',
            path: 'README.md',
            sourceUrl: 'https://github.com/owner/repo/blob/main/README.md',
          },
        ],
        warnings: [],
      };
    });
    const handler = createProjectsAgentSourcePreviewHandler({ createSourceBundle });
    const req = jsonRequest({
      githubRepoUrl: 'https://github.com/owner/repo',
    });
    const res = mockResponse();

    await handler(req, res);

    expect(createSourceBundle).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expect.objectContaining({
      hasSourceContext: true,
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 0,
      manifest: [
        expect.objectContaining({
          id: 'source-1',
          kind: 'github-file',
          label: 'owner/repo / README.md',
          repo: 'owner/repo',
          ref: 'main',
          path: 'README.md',
          sourceUrl: 'https://github.com/owner/repo/blob/main/README.md',
          included: true,
        }),
      ],
      limits: expect.objectContaining({
        githubMaxTreeEntries: expect.any(Number),
        githubMaxIncludedFiles: expect.any(Number),
        githubFileMaxBytes: expect.any(Number),
        githubTotalFetchedBytes: expect.any(Number),
        githubTotalTextMaxLength: expect.any(Number),
        githubTimeoutMs: expect.any(Number),
      }),
    }));
    expect(JSON.stringify(res.json())).not.toContain('# Repo notes');
    expect(res.json()).not.toHaveProperty('sources');
  });

  it('previews large repo source manifests with usable files despite excessive skipped warnings', async () => {
    const { fetchImpl } = createLargeRepoFetchFixture();
    const handler = createProjectsAgentSourcePreviewHandler({
      createSourceBundle: (input) => createProjectAgentSourceBundle({
        ...input,
        githubFetchImpl: fetchImpl,
      }),
    });
    const req = jsonRequest({
      githubRepoUrl: LARGE_REPO_URL,
    });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expect.objectContaining({
      hasSourceContext: true,
      sourceCount: 2,
      manifestCount: 2 + LARGE_REPO_SKIPPED_PATH_COUNT,
      warningCount: LARGE_REPO_SKIPPED_PATH_COUNT,
    }));
    expect(res.json().warningCount).toBeGreaterThan(25);
    expect(res.json().manifest.filter((entry) => entry.included).map((entry) => entry.path)).toEqual(
      expect.arrayContaining(['README.md', 'src/App.jsx']),
    );
    expect(JSON.stringify(res.json())).not.toContain(LARGE_REPO_INCLUDED_TEXT['README.md']);
    expect(res.json()).not.toHaveProperty('sources');
  });

  it('requires JSON or multipart source preview requests before normalizing sources', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const createSourceBundle = vi.fn();
    const handler = createProjectsAgentSourcePreviewHandler({ createSourceBundle });
    const req = jsonRequest({ sourceText: 'notes' }, 'text/plain');
    const res = mockResponse();

    await handler(req, res);

    expect(createSourceBundle).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Project agent source preview requests must use application/json or multipart/form-data.',
    });

    warn.mockRestore();
  });

  it('returns concise 400 responses for source preview multipart parse errors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const createSourceBundle = vi.fn();
    const handler = createProjectsAgentSourcePreviewHandler({ createSourceBundle });
    const req = Readable.from([Buffer.from('not multipart data')]);
    req.headers = {
      'content-type': 'multipart/form-data; boundary=broken',
      'content-length': Buffer.byteLength('not multipart data'),
    };
    const res = mockResponse();

    await handler(req, res);

    expect(createSourceBundle).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Admin multipart request could not be parsed',
    });

    warn.mockRestore();
  });
});

function jsonRequest(payload, contentType = 'application/json') {
  const body = JSON.stringify(payload);
  const req = Readable.from([Buffer.from(body)]);
  req.headers = {
    'content-type': contentType,
    'content-length': Buffer.byteLength(body),
  };

  return req;
}

function multipartRequest(payload, files = []) {
  const form = new FormData();
  form.set('payload', JSON.stringify(payload));

  for (const [name, value, filename] of files) {
    form.append(name, value, filename);
  }

  const request = new Request('http://localhost/admin-api/projects/agent/run', {
    method: 'POST',
    body: form,
  });
  const req = Readable.fromWeb(request.body);
  req.headers = Object.fromEntries(request.headers.entries());

  return req;
}

async function createZipBuffer(entries) {
  const zip = new JSZip();

  entries.forEach(({ path, text, bytes }) => {
    zip.file(path, bytes || text || '');
  });

  return await zip.generateAsync({ type: 'uint8array' });
}

function mockResponse() {
  return {
    statusCode: null,
    headers: null,
    body: '',
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
    json() {
      return JSON.parse(this.body);
    },
  };
}
