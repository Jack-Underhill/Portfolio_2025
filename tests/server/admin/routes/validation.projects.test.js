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
        featuredRank: '2',
        projectType: 'open-source',
        labels: [' Featured ', '', 'featured', 'Open Source'],
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
        featuredRank: 2,
        projectType: 'open-source',
        labels: ['Featured', 'Open Source'],
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

  it('defaults blank classification fields for existing projects', () => {
    expect(validateProjectsState({
      projectBio: '',
      projects: [{
        id: 12,
        title: 'Existing Project',
        featuredRank: '',
        projectType: '',
        labels: [],
      }],
    }).projects[0]).toMatchObject({
      id: 12,
      featuredRank: null,
      projectType: null,
      labels: [],
      published: true,
    });
  });

  it('rejects malformed project classification fields', () => {
    expect(() => validateProjectsState({
      projectBio: '',
      projects: [{ title: 'One', featuredRank: '1.5' }],
    })).toThrow('project 1 featured rank must be an integer');

    expect(() => validateProjectsState({
      projectBio: '',
      projects: [{ title: 'One', projectType: 'portfolio' }],
    })).toThrow('project 1 project type must be an accepted project type');

    expect(() => validateProjectsState({
      projectBio: '',
      projects: [{ title: 'One', labels: Array.from({ length: 13 }, (_, index) => `Label ${index}`) }],
    })).toThrow('project 1 labels must include 12 items or fewer');
  });
});
