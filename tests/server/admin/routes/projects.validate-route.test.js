import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireServiceClient } = vi.hoisted(() => ({
  requireServiceClient: vi.fn(() => {
    throw new Error('Supabase service client should not be used during validation');
  }),
}));

vi.mock('../../../../server/admin/clients/supabaseService.js', () => ({
  BUCKET: 'portfolio-assets',
  requireServiceClient,
}));

const { handleProjectsValidate } = await import(
  '../../../../server/admin/routes/projects.js'
);

describe('admin projects validate route', () => {
  beforeEach(() => {
    requireServiceClient.mockClear();
  });

  it('validates project drafts without requiring the service client', async () => {
    const req = jsonRequest({
      projects: {
        projectBio: ' Selected work ',
        projects: [
          {
            id: '',
            title: ' Draft project ',
            url: ' https://example.test ',
            imageUrl: '',
            videoUrl: '',
            architectureImageUrl: '',
            labels: [' Case Study '],
          },
        ],
      },
    });
    const res = mockResponse();

    await handleProjectsValidate(req, res);

    expect(requireServiceClient).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      ok: true,
      projectCount: 1,
    });
  });

  it('returns the shared project validation errors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const req = jsonRequest({
      projects: {
        projectBio: '',
        projects: [{ title: 'Draft project', projectType: 'portfolio' }],
      },
    });
    const res = mockResponse();

    await handleProjectsValidate(req, res);

    expect(requireServiceClient).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: 'project 1 project type must be an accepted project type',
    });

    warn.mockRestore();
  });
});

function jsonRequest(payload) {
  const body = JSON.stringify(payload);
  const req = Readable.from([Buffer.from(body)]);
  req.headers = {
    'content-type': 'application/json',
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
