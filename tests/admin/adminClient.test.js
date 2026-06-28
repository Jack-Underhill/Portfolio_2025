import { afterEach, describe, expect, it, vi } from 'vitest';

import { runProjectAgent } from '../../src/admin/api/adminClient.js';

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
});
