import { describe, expect, it } from 'vitest';

import { validateProjectsState } from '../../../../server/admin/routes/validation.js';

describe('admin projects validation', () => {
  it('normalizes project payloads and currently allows blank new-project IDs', () => {
    expect(validateProjectsState({
      projectBio: '  Selected work  ',
      projects: [{
        id: '',
        permalink: '  launch-console  ',
        title: ' Launch Console ',
        description: ' Mission dashboard ',
        url: ' https://launch.example.test ',
        imageUrl: '',
        videoUrl: null,
        architectureImageUrl: '',
        overview: ' Public-safe preview ',
        role: ' Full-stack engineer ',
        sourceUrl: 'https://github.com/example/launch-console',
        writeupUrl: '',
        videoPageUrl: '',
        techStack: {
          frontend: [' React ', '', 'Vite'],
          backend: [' Netlify Functions '],
          data: null,
        },
        techTags: [' React ', '', 'Supabase'],
        features: [' Fast routes ', ''],
        metrics: null,
        challenges: [
          { challenge: ' Drift ', solution: ' Pure validation ', result: ' Safer saves ' },
          { challenge: '', solution: '', result: '' },
        ],
        improvements: [' Group skills later '],
      }],
    })).toEqual({
      projectBio: 'Selected work',
      projects: [{
        id: null,
        permalink: 'launch-console',
        title: 'Launch Console',
        description: 'Mission dashboard',
        url: 'https://launch.example.test',
        imageUrl: '',
        videoUrl: '',
        architectureImageUrl: '',
        overview: 'Public-safe preview',
        role: 'Full-stack engineer',
        sourceUrl: 'https://github.com/example/launch-console',
        writeupUrl: '',
        videoPageUrl: '',
        imageFile: null,
        videoFile: null,
        architectureImageFile: null,
        techStack: {
          frontend: ['React', 'Vite'],
          backend: ['Netlify Functions'],
          data: [],
          infrastructure: [],
        },
        techTags: ['React', 'Supabase'],
        features: ['Fast routes'],
        metrics: null,
        challenges: [
          { challenge: 'Drift', solution: 'Pure validation', result: 'Safer saves' },
        ],
        improvements: ['Group skills later'],
        published: true,
      }],
    });
  });

  it('rejects duplicate existing project IDs before live writes', () => {
    expect(() => validateProjectsState({
      projectBio: '',
      projects: [
        { id: 12, title: 'One', url: '', imageUrl: '', videoUrl: '', architectureImageUrl: '' },
        { id: '12', title: 'Two', url: '', imageUrl: '', videoUrl: '', architectureImageUrl: '' },
      ],
    })).toThrow('project id 12 appears more than once');
  });
});
