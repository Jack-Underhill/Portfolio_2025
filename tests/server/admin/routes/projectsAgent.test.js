import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

import { describe, expect, it, vi } from 'vitest';

import { ProjectAgentRunError } from '../../../../server/admin/agent/projectAgentRun.js';
import {
  createProjectsAgentRunHandler,
  createProjectsAgentRuntimeHandler,
} from '../../../../server/admin/routes/projectsAgent.js';

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

  it('requires application/json requests before invoking Codex', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn();
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload, 'text/plain');
    const res = mockResponse();

    await handler(req, res);

    expect(runAgent).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Project agent run requests must use application/json.',
    });

    warn.mockRestore();
  });

  it('returns concise 400 responses for invalid project agent input', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'invalid_input',
        'Project agent instructions are required.',
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest({ ...validPayload, instructions: ' ' });
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'Project agent instructions are required.',
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
    });

    warn.mockRestore();
  });

  it('returns concise 500 responses for invalid Codex output', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runAgent = vi.fn(async () => {
      throw new ProjectAgentRunError(
        'invalid_patch',
        'features must be an array.',
        { stdout: 'raw output should not be returned' },
      );
    });
    const handler = createProjectsAgentRunHandler({ runAgent });
    const req = jsonRequest(validPayload);
    const res = mockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: 'Local Codex returned an invalid project patch.',
    });

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
    });

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

function jsonRequest(payload, contentType = 'application/json') {
  const body = JSON.stringify(payload);
  const req = Readable.from([Buffer.from(body)]);
  req.headers = {
    'content-type': contentType,
    'content-length': Buffer.byteLength(body),
  };

  return req;
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
