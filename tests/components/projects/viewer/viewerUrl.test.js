import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildArchitectureViewerUrl,
  getInlineSvgUrl,
  getSafeReturnTo,
  getTrustedViewerSrc,
  isSvgUrl,
  isTrustedSupabaseArchitectureSvgUrl,
} from '../../../../src/components/projects/viewer/viewerUrl.js';

const ORIGIN = 'https://portfolio.example.test';
const TRUSTED_ARCHITECTURE_SVG =
  'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg';
const TRUSTED_ARCHITECTURE_SVG_FOR_VIEWER =
  'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/42/architecture.svg';

describe('architecture viewer URL helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('identifies SVG URLs without trusting non-SVG extensions', () => {
    expect(isSvgUrl('https://cdn.example.test/diagram.svg')).toBe(true);
    expect(isSvgUrl('https://cdn.example.test/diagram.SVG?download=1')).toBe(true);
    expect(isSvgUrl('diagram.svg?cache=1')).toBe(true);

    expect(isSvgUrl('https://cdn.example.test/diagram.png')).toBe(false);
    expect(isSvgUrl('https://cdn.example.test/diagram.svg/preview')).toBe(false);
    expect(isSvgUrl(null)).toBe(false);
  });

  it('builds the current inline SVG proxy path only for SVG URLs', () => {
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', 'true');

    expect(getInlineSvgUrl(TRUSTED_ARCHITECTURE_SVG)).toBe(
      `/.netlify/functions/inline-svg?url=${encodeURIComponent(TRUSTED_ARCHITECTURE_SVG)}`,
    );
    expect(getInlineSvgUrl('https://abc123.supabase.co/diagram.png')).toBe(
      'https://abc123.supabase.co/diagram.png',
    );
  });

  it('accepts only the current trusted Supabase project-scoped architecture SVG path', () => {
    expect(isTrustedSupabaseArchitectureSvgUrl(TRUSTED_ARCHITECTURE_SVG)).toBe(true);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/ARCHITECTURE.SVG',
    )).toBe(true);
  });

  it('rejects untrusted architecture SVG hosts, buckets, paths, extensions, and malformed values', () => {
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'http://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co.evil.test/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://cdn.example.test/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/other-bucket/projects/7/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/project-architecture/launch.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/0/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/diagram.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.png',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.png?file=architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/%2e%2e/architecture.svg',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl(
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/projects/7/architecture.svg%3Fdownload=.png',
    )).toBe(false);
    expect(isTrustedSupabaseArchitectureSvgUrl('not a url.svg')).toBe(false);
  });

  it('returns a normalized inline proxy URL for trusted viewer sources', () => {
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', 'true');

    const rawViewerSrc = `/.netlify/functions/inline-svg?url=${encodeURIComponent(TRUSTED_ARCHITECTURE_SVG)}`;

    expect(getTrustedViewerSrc(rawViewerSrc, ORIGIN)).toBe(
      `/.netlify/functions/inline-svg?url=${encodeURIComponent(TRUSTED_ARCHITECTURE_SVG)}`,
    );
  });

  it('rejects unsafe viewer sources before object rendering', () => {
    vi.stubEnv('VITE_ENABLE_NETLIFY_FUNCTIONS', 'true');

    const untrustedTarget = 'https://cdn.example.test/architecture.svg';
    const legacyProjectArchitectureTarget =
      'https://abc123.supabase.co/storage/v1/object/public/portfolio-assets/project-architecture/launch.svg';

    expect(getTrustedViewerSrc(TRUSTED_ARCHITECTURE_SVG, ORIGIN)).toBeNull();
    expect(getTrustedViewerSrc(
      `https://other.example.test/.netlify/functions/inline-svg?url=${encodeURIComponent(TRUSTED_ARCHITECTURE_SVG)}`,
      ORIGIN,
    )).toBeNull();
    expect(getTrustedViewerSrc(
      `/.netlify/functions/track-visit?url=${encodeURIComponent(TRUSTED_ARCHITECTURE_SVG)}`,
      ORIGIN,
    )).toBeNull();
    expect(getTrustedViewerSrc(
      `/.netlify/functions/inline-svg?url=${encodeURIComponent(untrustedTarget)}`,
      ORIGIN,
    )).toBeNull();
    expect(getTrustedViewerSrc(
      `/.netlify/functions/inline-svg?url=${encodeURIComponent(legacyProjectArchitectureTarget)}`,
      ORIGIN,
    )).toBeNull();
    expect(getTrustedViewerSrc('://bad-url', ORIGIN)).toBeNull();
  });

  it('accepts only internal return paths and falls back for external values', () => {
    expect(getSafeReturnTo('/p/7-launch-console')).toBe('/p/7-launch-console');
    expect(getSafeReturnTo('/p/7-launch-console?tab=architecture')).toBe(
      '/p/7-launch-console?tab=architecture',
    );
    expect(getSafeReturnTo(' /p/7-launch-console ')).toBe('/p/7-launch-console');

    expect(getSafeReturnTo('https://evil.example.test/p/7', '/projects')).toBe('/projects');
    expect(getSafeReturnTo('//evil.example.test/p/7', '/projects')).toBe('/projects');
    expect(getSafeReturnTo('javascript:alert(1)', '/projects')).toBe('/projects');
    expect(getSafeReturnTo('/safe', 'https://bad-fallback.example.test')).toBe('/safe');
    expect(getSafeReturnTo('', 'https://bad-fallback.example.test')).toBe('/');
  });

  it('builds the viewer route with encoded src, title, and safe return path', () => {
    const viewerUrl = buildArchitectureViewerUrl({
      src: TRUSTED_ARCHITECTURE_SVG_FOR_VIEWER,
      title: 'Launch Console / Architecture',
      returnTo: 'https://evil.example.test/p/7',
    });
    const parsed = new URL(viewerUrl, ORIGIN);

    expect(parsed.pathname).toBe('/architecture-viewer');
    expect(parsed.searchParams.get('src')).toBe(TRUSTED_ARCHITECTURE_SVG_FOR_VIEWER);
    expect(parsed.searchParams.get('title')).toBe('Launch Console / Architecture');
    expect(parsed.searchParams.get('returnTo')).toBe('/');
  });
});
