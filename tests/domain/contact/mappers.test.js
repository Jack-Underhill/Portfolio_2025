import { describe, expect, it } from 'vitest';

import { mapContactRowsToPublic } from '../../../src/domain/contact/mappers.js';

describe('contact public mapper', () => {
  it('maps contact link rows to the public link shape', () => {
    expect(mapContactRowsToPublic({
      links: [
        {
          id: 'github',
          label: ' GitHub ',
          url: ' https://github.com/example ',
          svg: ' https://cdn.example.test/github.svg ',
        },
      ],
    })).toEqual({
      links: [
        {
          id: 'github',
          platform: 'GitHub',
          url: 'https://github.com/example',
          iconUrl: 'https://cdn.example.test/github.svg',
        },
      ],
    });
  });

  it('filters links with empty URLs while preserving uploaded icon URLs', () => {
    expect(mapContactRowsToPublic({
      links: [
        {
          id: 'missing-url',
          label: 'Missing URL',
          url: ' ',
          svg: 'https://cdn.example.test/missing.svg',
        },
        {
          id: 'portfolio',
          label: 'Portfolio',
          url: 'https://example.test',
          svg: 'https://cdn.example.test/uploaded-icon.svg',
        },
      ],
    })?.links).toEqual([
      {
        id: 'portfolio',
        platform: 'Portfolio',
        url: 'https://example.test',
        iconUrl: 'https://cdn.example.test/uploaded-icon.svg',
      },
    ]);
  });

  it('ignores legacy skill rows because Skills now has its own public mapper', () => {
    expect(mapContactRowsToPublic({
      skills: [
        { name: ' JavaScript ', level: 'legacy-primary' },
        { name: ' Supabase ', level: 'legacy-secondary' },
      ],
    })).toBeNull();
  });

  it('returns null when contact rows contain no public links', () => {
    expect(mapContactRowsToPublic({
      skills: 'JavaScript',
      links: [
        {
          id: 'blank',
          label: 'Blank',
          url: 'NULL',
          svg: 'https://cdn.example.test/blank.svg',
        },
      ],
    })).toBeNull();

    expect(mapContactRowsToPublic()).toBeNull();
  });
});
