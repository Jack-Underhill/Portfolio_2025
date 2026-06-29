import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  loadProjectAgentRuntime,
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

  it('surfaces concise admin route errors from failed project agent runs', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      error: 'Local Codex returned an invalid project patch.',
    }), {
      status: 500,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runProjectAgent({
      intent: 'revise',
      instructions: 'Update features.',
      projectContext,
    })).rejects.toThrow('Local Codex returned an invalid project patch.');
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
