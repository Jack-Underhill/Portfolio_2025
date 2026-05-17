import { describe, expect, it } from 'vitest';

import {
  mapProjectRowToPublicCard,
  mapProjectRowToPublicDetails,
  mergeProjectViewModels,
  normalizeProjectSortOrder,
  toProjectCardViewModel,
  toProjectDetailsViewModel,
} from '../../../src/domain/projects/mappers.js';

describe('project public mappers', () => {
  it('maps database project rows to the public card shape', () => {
    expect(mapProjectRowToPublicCard({
      id: 7,
      permalink: '  7-launch-console  ',
      image_url: ' https://cdn.example.test/card.png ',
      video_url: ' https://cdn.example.test/card.mp4 ',
      title: ' Launch Console ',
      card_description: ' Mission-control dashboard ',
      live_url: '',
      source_url: ' https://github.com/example/launch-console ',
      tech_tags: [' React ', null, 'NULL', 'Supabase'],
    })).toEqual({
      id: 7,
      permalink: '7-launch-console',
      imageUrl: 'https://cdn.example.test/card.png',
      videoUrl: 'https://cdn.example.test/card.mp4',
      title: 'Launch Console',
      description: 'Mission-control dashboard',
      directUrl: 'https://github.com/example/launch-console',
      techTags: ['React', 'Supabase'],
    });
  });

  it('maps database project rows to the public detail shape', () => {
    expect(mapProjectRowToPublicDetails({
      id: 7,
      permalink: '7-launch-console',
      title: 'Launch Console',
      image_url: 'https://cdn.example.test/detail.png',
      video_url: 'https://cdn.example.test/detail.mp4',
      live_url: 'https://launch.example.test',
      source_url: 'https://github.com/example/launch-console',
      writeup_url: 'https://example.test/writeup',
      video_page_url: 'https://example.test/video',
      overview: 'Built a public-safe launch dashboard.',
      role: 'Full-stack engineer',
      architecture_image_url: 'https://cdn.example.test/architecture.svg',
      tech_stack: {
        frontend: ['React'],
        backend: ['Netlify Functions'],
        data: ['Supabase'],
        infrastructure: ['Netlify'],
      },
      features: [' dashboards ', '', 'NULL', 'role-based previews'],
      metrics: ['99% static delivery'],
      challenges: [{ title: 'Routing drift', solution: 'Pure helpers' }],
      improvements: ['Add grouped skills'],
      published: 1,
      sort_order: 3,
    })).toEqual({
      id: 7,
      permalink: '7-launch-console',
      title: 'Launch Console',
      imageUrl: 'https://cdn.example.test/detail.png',
      videoUrl: 'https://cdn.example.test/detail.mp4',
      liveUrl: 'https://launch.example.test',
      sourceUrl: 'https://github.com/example/launch-console',
      writeupUrl: 'https://example.test/writeup',
      videoPageUrl: 'https://example.test/video',
      overview: 'Built a public-safe launch dashboard.',
      role: 'Full-stack engineer',
      architectureImageUrl: 'https://cdn.example.test/architecture.svg',
      techStack: {
        frontend: ['React'],
        backend: ['Netlify Functions'],
        data: ['Supabase'],
        infrastructure: ['Netlify'],
      },
      features: ['dashboards', 'role-based previews'],
      metrics: ['99% static delivery'],
      challenges: [{ title: 'Routing drift', solution: 'Pure helpers' }],
      improvements: ['Add grouped skills'],
      published: true,
      sortOrder: 3,
    });
  });

  it('returns safe arrays for empty or malformed project detail list fields', () => {
    expect(mapProjectRowToPublicDetails({
      id: 8,
      features: 'feature',
      metrics: { uptime: '99%' },
      challenges: 'challenge',
      improvements: null,
    })).toMatchObject({
      features: [],
      metrics: [],
      challenges: [],
      improvements: [],
    });
  });

  it('returns null for a missing project detail row', () => {
    expect(mapProjectRowToPublicDetails(null)).toBeNull();
  });

  it('builds a card view model with fallback image and empty detail defaults', () => {
    expect(toProjectCardViewModel({
      id: null,
      permalink: ' 9-offline-cache ',
      imageUrl: 'NULL',
      videoUrl: ' ',
      title: '',
      description: '',
      directUrl: ' https://example.test ',
      techTags: [' Vite ', undefined],
    }, {
      fallbackId: 0,
      fallbackImageUrl: '/fallback.png',
    })).toEqual({
      id: 0,
      permalink: '9-offline-cache',
      imageUrl: '/fallback.png',
      videoUrl: null,
      title: null,
      description: null,
      directUrl: 'https://example.test',
      techTags: ['Vite'],
      overview: null,
      role: null,
      techStack: null,
      architectureImageUrl: null,
      features: [],
      metrics: null,
      challenges: [],
      improvements: [],
    });
  });

  it('builds a complete detail view model from the public detail shape', () => {
    const detail = mapProjectRowToPublicDetails({
      id: 10,
      permalink: '10-architecture-viewer',
      title: 'Architecture Viewer',
      image_url: 'https://cdn.example.test/viewer.png',
      video_url: 'https://cdn.example.test/viewer.mp4',
      live_url: 'https://viewer.example.test',
      source_url: 'https://github.com/example/viewer',
      writeup_url: 'https://example.test/viewer-notes',
      video_page_url: 'https://example.test/viewer-demo',
      overview: null,
      role: 'Developer',
      architecture_image_url: 'https://cdn.example.test/viewer.svg',
      tech_stack: { frontend: ['React'] },
      features: ['Preview SVGs'],
      metrics: ['0 live service calls'],
      challenges: [],
      improvements: ['Tighten storage paths'],
    });

    expect(toProjectDetailsViewModel(detail)).toEqual({
      id: 10,
      permalink: '10-architecture-viewer',
      title: 'Architecture Viewer',
      imageUrl: 'https://cdn.example.test/viewer.png',
      videoUrl: 'https://cdn.example.test/viewer.mp4',
      liveUrl: 'https://viewer.example.test',
      sourceUrl: 'https://github.com/example/viewer',
      writeupUrl: 'https://example.test/viewer-notes',
      videoPageUrl: 'https://example.test/viewer-demo',
      overview: '',
      role: 'Developer',
      architectureImageUrl: 'https://cdn.example.test/viewer.svg',
      techStack: { frontend: ['React'] },
      features: ['Preview SVGs'],
      metrics: ['0 live service calls'],
      challenges: [],
      improvements: ['Tighten storage paths'],
    });
  });

  it('returns null for a missing project detail view model source', () => {
    expect(toProjectDetailsViewModel(null)).toBeNull();
  });

  it('merges card fallbacks only when detail values are empty', () => {
    const card = {
      permalink: '11-card-permalink',
      title: 'Card title',
      imageUrl: '/card.png',
      videoUrl: '/card.mp4',
    };

    expect(mergeProjectViewModels(card, {
      permalink: '',
      title: 'Detail title',
      imageUrl: null,
      videoUrl: '/detail.mp4',
      overview: 'Detail overview',
    })).toEqual({
      permalink: '11-card-permalink',
      title: 'Detail title',
      imageUrl: '/card.png',
      videoUrl: '/detail.mp4',
      overview: 'Detail overview',
    });
  });

  it('normalizes project sort order by current array position', () => {
    expect(normalizeProjectSortOrder([
      { id: 3, sortOrder: 10 },
      { id: 1 },
      { id: 2, sortOrder: 2 },
    ])).toEqual([
      { id: 3, sortOrder: 0 },
      { id: 1, sortOrder: 1 },
      { id: 2, sortOrder: 2 },
    ]);

    expect(normalizeProjectSortOrder(null)).toEqual([]);
  });
});
