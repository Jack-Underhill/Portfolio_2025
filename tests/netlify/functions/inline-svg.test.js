import { afterEach, describe, expect, it, vi } from 'vitest';

import handler from '../../../netlify/functions/inline-svg.js';

const TRUSTED_ARCHITECTURE_SVG =
  'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg';

function makeRequest(targetUrl) {
  return new Request(
    `https://portfolio.example.test/.netlify/functions/inline-svg?url=${encodeURIComponent(targetUrl)}`,
  );
}

describe('inline-svg Netlify function', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies only the project-scoped Supabase architecture SVG path', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg />', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await handler(makeRequest(TRUSTED_ARCHITECTURE_SVG));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');
    expect(String(fetchMock.mock.calls[0][0])).toBe(TRUSTED_ARCHITECTURE_SVG);
  });

  it('rejects untrusted SVG targets without fetching them', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const invalidTargets = [
      'http://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
      'https://abc123.supabase.co.evil.test/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
      'https://cdn.example.test/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
      'https://abc123.supabase.co/storage/v1/object/public/other-bucket/projects/7/architecture.svg',
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/project-architecture/launch.svg',
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/diagram.svg',
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.png',
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.png?file=architecture.svg',
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/%2e%2e/architecture.svg',
      'not a url.svg',
    ];

    for (const target of invalidTargets) {
      const response = await handler(makeRequest(target));
      expect(response.status).toBe(400);
    }

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
