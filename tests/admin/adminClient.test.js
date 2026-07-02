import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  loadProjectAgentRuntime,
  previewProjectAgentSources,
  runProjectAgent,
} from '../../src/admin/api/adminClient.js';

const projectContext = {
  projectContext: {
    id: 42,
    title: 'Current title',
    permalink: 'current-title',
  },
  draft: {
    title: 'Current title',
    description: 'Current card copy',
  },
};

describe('admin API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts project agent runs as JSON to the local admin route', async () => {
    const responseBody = {
      patch: { title: 'Revised title' },
      notes: ['Updated the title.'],
      warnings: [],
      appliedFields: ['title'],
      elapsedMs: 25,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runProjectAgent({
      intent: 'revise',
      instructions: 'Tighten the overview.',
      projectContext,
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/run',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: 'revise',
          instructions: 'Tighten the overview.',
          projectContext,
        }),
      },
    );
  });

  it('keeps pasted source-only project agent runs on the JSON path', async () => {
    const responseBody = {
      patch: {},
      notes: ['Reviewed against source.'],
      warnings: [],
      appliedFields: [],
      elapsedMs: 25,
      sourceManifest: [],
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runProjectAgent({
      intent: 'review',
      instructions: 'Check the draft against the notes.',
      projectContext,
      sourceText: 'Launch notes and metrics.',
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/run',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: 'review',
          instructions: 'Check the draft against the notes.',
          projectContext,
          sourceText: 'Launch notes and metrics.',
        }),
      },
    );
  });

  it('keeps empty source file arrays on the JSON path', async () => {
    const responseBody = {
      patch: { title: 'Revised title' },
      notes: [],
      warnings: [],
      appliedFields: ['title'],
      elapsedMs: 25,
      sourceManifest: [],
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runProjectAgent({
      intent: 'revise',
      instructions: 'Tighten the overview.',
      projectContext,
      sourceFiles: [],
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/run',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: 'revise',
          instructions: 'Tighten the overview.',
          projectContext,
        }),
      },
    );
  });

  it('posts project agent source files as multipart under the sourceFiles field', async () => {
    const responseBody = {
      patch: { description: 'Revised card copy' },
      notes: ['Used attached source material.'],
      warnings: [],
      appliedFields: ['description'],
      elapsedMs: 25,
      sourceManifest: [],
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);
    const sourceFiles = [
      new File(['# Report'], 'report.md', { type: 'text/markdown' }),
      new File(['name,value\nwins,3'], 'metrics.csv', { type: 'text/csv' }),
    ];

    await expect(runProjectAgent({
      intent: 'revise',
      instructions: 'Use the source files.',
      projectContext,
      sourceText: 'Owner source note.',
      sourceFiles,
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(JSON.parse(options.body.get('payload'))).toEqual({
      intent: 'revise',
      instructions: 'Use the source files.',
      projectContext,
      sourceText: 'Owner source note.',
    });
    expect(options.body.getAll('sourceFiles')).toEqual(sourceFiles);
  });

  it('previews pasted project agent sources as JSON without invoking a run route', async () => {
    const responseBody = {
      hasSourceContext: true,
      manifest: [{ id: 'source-1', label: 'Pasted source material', included: true }],
      warnings: [],
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 0,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(previewProjectAgentSources({
      sourceText: 'Launch notes and metrics.',
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/sources/preview',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sourceText: 'Launch notes and metrics.',
        }),
      },
    );
  });

  it('previews project agent source files as multipart under the sourceFiles field', async () => {
    const responseBody = {
      hasSourceContext: true,
      manifest: [{ id: 'source-1', label: 'report.md', included: true }],
      warnings: [],
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 0,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);
    const sourceFiles = [
      new File(['# Report'], 'report.md', { type: 'text/markdown' }),
    ];

    await expect(previewProjectAgentSources({
      sourceText: 'Owner source note.',
      sourceFiles,
    })).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(JSON.parse(options.body.get('payload'))).toEqual({
      sourceText: 'Owner source note.',
    });
    expect(options.body.getAll('sourceFiles')).toEqual(sourceFiles);
  });

  it('surfaces concise admin route errors from failed project agent runs', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      error: 'Local Codex returned an invalid project patch.',
      details: {
        type: 'invalid_patch',
        message: 'features must be an array.',
        runPlan: 'revise-with-source-context',
        sourceCount: 1,
      },
    }), {
      status: 500,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runProjectAgent({
      intent: 'revise',
      instructions: 'Update features.',
      projectContext,
    })).rejects.toMatchObject({
      message: 'Local Codex returned an invalid project patch.',
      details: {
        type: 'invalid_patch',
        message: 'features must be an array.',
        runPlan: 'revise-with-source-context',
        sourceCount: 1,
      },
    });
  });

  it('loads project agent runtime metadata from the local admin route', async () => {
    const responseBody = {
      model: 'gpt-5.5',
      modelReasoningEffort: 'high',
      modelLabel: 'gpt-5.5',
      modelSource: 'user-config',
      modelSourceLabel: 'Codex user config',
      isModelExplicit: true,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadProjectAgentRuntime()).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/runtime',
      {},
    );
  });

  it('loads fallback project agent runtime metadata as a successful response', async () => {
    const responseBody = {
      model: null,
      modelReasoningEffort: null,
      modelLabel: 'Codex default',
      modelSource: 'default',
      modelSourceLabel: 'Codex built-in default',
      isModelExplicit: false,
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(responseBody), {
      status: 200,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadProjectAgentRuntime()).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/admin-api/projects/agent/runtime',
      {},
    );
  });

  it('surfaces concise admin route errors from failed runtime metadata loads', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      error: 'Project agent runtime metadata could not be loaded.',
    }), {
      status: 500,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadProjectAgentRuntime()).rejects.toThrow(
      'Project agent runtime metadata could not be loaded.',
    );
  });
});
