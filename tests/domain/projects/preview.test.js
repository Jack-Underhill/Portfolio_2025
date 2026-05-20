import { describe, expect, it } from 'vitest';

import { mapProjectDraftToPreviewProject } from '../../../src/domain/projects/preview.js';

describe('project draft preview mapper', () => {
  it('maps a complete admin draft to the public modal preview shape', () => {
    const challenges = [
      {
        challenge: 'Draft review drift',
        solution: 'Map once in the domain layer',
        result: 'The modal gets one stable shape',
      },
    ];

    expect(mapProjectDraftToPreviewProject({
      id: 'draft-1',
      permalink: ' draft-preview ',
      title: ' Draft Preview ',
      imageUrl: ' https://cdn.example.test/image.png ',
      videoUrl: ' https://cdn.example.test/video.mp4 ',
      url: ' https://demo.example.test ',
      sourceUrl: ' https://github.com/example/preview ',
      writeupUrl: ' https://example.test/writeup ',
      videoPageUrl: ' https://example.test/video ',
      overview: ' Preview the unsaved case study. ',
      role: ' Full-stack engineer ',
      architectureImageUrl: ' https://cdn.example.test/architecture.svg ',
      techStack: {
        frontend: [' React ', '', 'NULL'],
        backend: [' Node '],
        data: [' Supabase '],
        infrastructure: [' Netlify '],
      },
      features: [' draft modal ', '', 'NULL', 'public shape'],
      metrics: [' no writes '],
      challenges,
      improvements: [' validate before saving '],
      featuredRank: '2',
      projectType: 'personal',
      labels: [' Admin ', 'Admin', 'Preview'],
      published: true,
      sortOrder: '4',
    })).toEqual({
      id: 'draft-1',
      permalink: 'draft-preview',
      title: 'Draft Preview',
      imageUrl: 'https://cdn.example.test/image.png',
      videoUrl: 'https://cdn.example.test/video.mp4',
      liveUrl: 'https://demo.example.test',
      sourceUrl: 'https://github.com/example/preview',
      writeupUrl: 'https://example.test/writeup',
      videoPageUrl: 'https://example.test/video',
      overview: 'Preview the unsaved case study.',
      role: 'Full-stack engineer',
      architectureImageUrl: 'https://cdn.example.test/architecture.svg',
      techStack: {
        frontend: ['React'],
        backend: ['Node'],
        data: ['Supabase'],
        infrastructure: ['Netlify'],
      },
      features: ['draft modal', 'public shape'],
      metrics: ['no writes'],
      challenges,
      improvements: ['validate before saving'],
      isFeatured: true,
      featuredRank: 2,
      projectType: 'personal',
      labels: ['Admin', 'Preview'],
      published: true,
      sortOrder: 4,
    });
  });

  it('returns stable empty values for empty optional fields', () => {
    expect(mapProjectDraftToPreviewProject({
      id: null,
      title: 'NULL',
      imageUrl: '',
      videoUrl: undefined,
      url: ' ',
      sourceUrl: null,
      writeupUrl: '',
      videoPageUrl: '',
      overview: null,
      role: undefined,
      architectureImageUrl: 'NULL',
      techStack: null,
      features: null,
      metrics: undefined,
      challenges: null,
      improvements: 'add polish',
      published: false,
    })).toEqual({
      id: null,
      permalink: '',
      title: '',
      imageUrl: '',
      videoUrl: '',
      liveUrl: '',
      sourceUrl: '',
      writeupUrl: '',
      videoPageUrl: '',
      overview: '',
      role: '',
      architectureImageUrl: '',
      techStack: null,
      features: [],
      metrics: [],
      challenges: [],
      improvements: [],
      isFeatured: false,
      featuredRank: null,
      projectType: null,
      labels: [],
      published: false,
      sortOrder: 0,
    });
  });

  it('normalizes project classification fields with public mapper-compatible rules', () => {
    expect(mapProjectDraftToPreviewProject({
      featuredRank: '3',
      projectType: 'open-source',
      labels: [' Tooling ', 'Tooling', 'Open Source'],
    })).toMatchObject({
      isFeatured: true,
      featuredRank: 3,
      projectType: 'open-source',
      labels: ['Tooling', 'Open Source'],
    });

    expect(mapProjectDraftToPreviewProject({
      featuredRank: '1.5',
      projectType: 'portfolio',
      labels: [' ', null, 'NULL', 'Client'],
    })).toMatchObject({
      isFeatured: false,
      featuredRank: null,
      projectType: null,
      labels: ['Client'],
    });
  });

  it('falls back safely for malformed list fields', () => {
    expect(mapProjectDraftToPreviewProject({
      techStack: ['React'],
      features: 'draft preview',
      metrics: { score: 'high' },
      challenges: 'challenge',
      improvements: 42,
    })).toMatchObject({
      techStack: null,
      features: [],
      metrics: [],
      challenges: [],
      improvements: [],
    });
  });

  it('preserves challenge item shape for modal rendering', () => {
    const challenges = [
      { challenge: 'One', solution: 'Two', result: 'Three' },
      { title: 'Legacy title', body: ['Keep custom draft shape intact'] },
    ];

    expect(mapProjectDraftToPreviewProject({ challenges }).challenges).toBe(challenges);
  });
});
