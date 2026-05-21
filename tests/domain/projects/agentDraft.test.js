import { describe, expect, it } from 'vitest';

import {
  AgentProjectDraftImportError,
  applyAgentProjectDraftPatch,
  createAgentProjectDraftReviewContext,
  mapAgentProjectDraftToProjectPatch,
  parseAgentProjectDraftPayload,
  stringifyAgentProjectDraftReviewContext,
} from '../../../src/domain/projects/agentDraft.js';

function createActiveProject() {
  return {
    id: 42,
    permalink: 'active-project',
    sortOrder: 7,
    imageUrl: 'https://cdn.example.test/current.png',
    videoUrl: 'https://cdn.example.test/current.mp4',
    architectureImageUrl: 'https://cdn.example.test/current-architecture.svg',
    imageFile: { name: 'current.png' },
    videoFile: { name: 'current.mp4' },
    architectureImageFile: { name: 'current-architecture.svg' },
    title: 'Current title',
    description: 'Current card copy',
    overview: 'Current overview',
    role: 'Current role',
    url: 'https://current.example.test',
    sourceUrl: '',
    writeupUrl: '',
    videoPageUrl: '',
    techStack: {
      frontend: ['React'],
      backend: ['Node'],
      data: ['Supabase'],
      infrastructure: ['Netlify'],
    },
    techTags: ['React', 'Node'],
    features: ['Current feature'],
    metrics: ['Current metric'],
    challenges: [],
    improvements: ['Current improvement'],
    featuredRank: '',
    projectType: '',
    labels: ['Current'],
    published: true,
  };
}

describe('agent project draft import helpers', () => {
  it('parses and applies a complete payload to the active project draft', () => {
    const activeProject = createActiveProject();
    const payload = {
      title: ' Agent-assisted case study ',
      description: ' Concise card summary ',
      overview: ' Modal-ready overview ',
      role: ' Full-stack owner ',
      url: ' https://demo.example.test ',
      sourceUrl: ' https://github.com/example/project ',
      writeupUrl: ' https://example.test/writeup ',
      videoPageUrl: ' https://example.test/video ',
      features: [' Intake flow ', '', 'NULL', 'preview loop'],
      metrics: [' 0 Supabase writes during import '],
      improvements: [' Add richer review summaries later '],
      challenges: [
        {
          challenge: ' Drift-prone agent output ',
          solution: ' Pin the payload contract in a pure helper ',
          result: ' Admin imports one stable shape ',
        },
      ],
      techStack: {
        frontend: [' React ', 'Vite'],
        backend: [' Node '],
        data: [' Supabase '],
        infrastructure: [' Netlify '],
      },
      featuredRank: '3',
      projectType: 'personal',
      labels: [' AI-assisted ', 'ai-assisted', 'Portfolio'],
      published: false,
    };

    expect(applyAgentProjectDraftPatch(activeProject, JSON.stringify(payload, null, 2))).toEqual({
      project: {
        ...activeProject,
        title: 'Agent-assisted case study',
        description: 'Concise card summary',
        overview: 'Modal-ready overview',
        role: 'Full-stack owner',
        url: 'https://demo.example.test',
        sourceUrl: 'https://github.com/example/project',
        writeupUrl: 'https://example.test/writeup',
        videoPageUrl: 'https://example.test/video',
        features: ['Intake flow', 'preview loop'],
        metrics: ['0 Supabase writes during import'],
        improvements: ['Add richer review summaries later'],
        challenges: [
          {
            challenge: 'Drift-prone agent output',
            solution: 'Pin the payload contract in a pure helper',
            result: 'Admin imports one stable shape',
          },
        ],
        techStack: {
          frontend: ['React', 'Vite'],
          backend: ['Node'],
          data: ['Supabase'],
          infrastructure: ['Netlify'],
        },
        featuredRank: 3,
        projectType: 'personal',
        labels: ['AI-assisted', 'Portfolio'],
        published: false,
      },
      patch: {
        title: 'Agent-assisted case study',
        description: 'Concise card summary',
        overview: 'Modal-ready overview',
        role: 'Full-stack owner',
        url: 'https://demo.example.test',
        sourceUrl: 'https://github.com/example/project',
        writeupUrl: 'https://example.test/writeup',
        videoPageUrl: 'https://example.test/video',
        features: ['Intake flow', 'preview loop'],
        metrics: ['0 Supabase writes during import'],
        improvements: ['Add richer review summaries later'],
        challenges: [
          {
            challenge: 'Drift-prone agent output',
            solution: 'Pin the payload contract in a pure helper',
            result: 'Admin imports one stable shape',
          },
        ],
        techStack: {
          frontend: ['React', 'Vite'],
          backend: ['Node'],
          data: ['Supabase'],
          infrastructure: ['Netlify'],
        },
        featuredRank: 3,
        projectType: 'personal',
        labels: ['AI-assisted', 'Portfolio'],
        published: false,
      },
      appliedFields: [
        'title',
        'description',
        'overview',
        'role',
        'url',
        'sourceUrl',
        'writeupUrl',
        'videoPageUrl',
        'features',
        'metrics',
        'improvements',
        'challenges',
        'techStack',
        'projectType',
        'labels',
        'published',
        'featuredRank',
      ],
      warnings: [],
    });
  });

  it('extracts the first fenced JSON payload from pasted agent text', () => {
    const pastedText = [
      'Here is the import payload:',
      '```json',
      '{ "title": " Fenced draft ", "features": [" Works from chat "] }',
      '```',
      'Assumptions: keep outside JSON.',
    ].join('\n');

    expect(parseAgentProjectDraftPayload(pastedText).payload).toEqual({
      title: ' Fenced draft ',
      features: [' Works from chat '],
    });

    expect(applyAgentProjectDraftPatch(createActiveProject(), pastedText).project).toMatchObject({
      title: 'Fenced draft',
      features: ['Works from chat'],
    });
  });

  it('rejects invalid JSON and non-object payloads with concise errors', () => {
    expect(() => parseAgentProjectDraftPayload('{ title: "Missing quotes" }')).toThrow(
      new AgentProjectDraftImportError('Agent draft payload must be valid JSON.'),
    );

    expect(() => parseAgentProjectDraftPayload('["not", "an", "object"]')).toThrow(
      new AgentProjectDraftImportError('Agent draft payload must be a JSON object.'),
    );
  });

  it('ignores unsupported keys as warnings without mutating protected fields', () => {
    const activeProject = createActiveProject();
    const result = applyAgentProjectDraftPatch(activeProject, {
      id: 999,
      permalink: 'new-permalink',
      sortOrder: 0,
      imageUrl: 'https://cdn.example.test/new.png',
      videoUrl: 'https://cdn.example.test/new.mp4',
      architectureImageUrl: 'https://cdn.example.test/new-architecture.svg',
      techTags: ['Injected'],
      title: 'Imported title',
    });

    expect(result.project).toMatchObject({
      id: 42,
      permalink: 'active-project',
      sortOrder: 7,
      imageUrl: 'https://cdn.example.test/current.png',
      videoUrl: 'https://cdn.example.test/current.mp4',
      architectureImageUrl: 'https://cdn.example.test/current-architecture.svg',
      techTags: ['React', 'Node'],
      title: 'Imported title',
    });
    expect(result.project.imageFile).toBe(activeProject.imageFile);
    expect(result.project.videoFile).toBe(activeProject.videoFile);
    expect(result.project.architectureImageFile).toBe(activeProject.architectureImageFile);
    expect(result.warnings).toEqual([
      'Ignored unsupported project draft field "id".',
      'Ignored unsupported project draft field "permalink".',
      'Ignored unsupported project draft field "sortOrder".',
      'Ignored unsupported project draft field "imageUrl".',
      'Ignored unsupported project draft field "videoUrl".',
      'Ignored unsupported project draft field "architectureImageUrl".',
      'Ignored unsupported project draft field "techTags".',
    ]);
  });

  it('rejects malformed list fields before falling back to the current project', () => {
    expect(() => mapAgentProjectDraftToProjectPatch({ features: 'one feature' })).toThrow(
      new AgentProjectDraftImportError('features must be an array.'),
    );

    expect(() => mapAgentProjectDraftToProjectPatch({
      metrics: ['valid', 42],
    })).toThrow(new AgentProjectDraftImportError('metrics item 2 must be a string.'));
  });

  it('normalizes valid challenge objects and rejects malformed challenge shapes', () => {
    expect(mapAgentProjectDraftToProjectPatch({
      challenges: [
        { challenge: ' One ', solution: ' Two ', result: ' Three ' },
        { challenge: '', solution: '', result: '' },
      ],
    }).patch.challenges).toEqual([
      { challenge: 'One', solution: 'Two', result: 'Three' },
    ]);

    expect(() => mapAgentProjectDraftToProjectPatch({ challenges: ['not an object'] })).toThrow(
      new AgentProjectDraftImportError('challenges item 1 must be an object.'),
    );
  });

  it('normalizes classification fields and rejects invalid classifications', () => {
    expect(mapAgentProjectDraftToProjectPatch({
      projectType: 'open-source',
      labels: [' Tooling ', 'tooling', 'Client'],
      featuredRank: 2,
      published: true,
    }).patch).toMatchObject({
      projectType: 'open-source',
      labels: ['Tooling', 'Client'],
      featuredRank: 2,
      published: true,
    });

    expect(() => mapAgentProjectDraftToProjectPatch({ projectType: 'portfolio' })).toThrow(
      new AgentProjectDraftImportError('projectType must be an accepted project type.'),
    );
    expect(() => mapAgentProjectDraftToProjectPatch({ featuredRank: '2.5' })).toThrow(
      new AgentProjectDraftImportError('featuredRank must be an integer.'),
    );
    expect(() => mapAgentProjectDraftToProjectPatch({ published: 'yes' })).toThrow(
      new AgentProjectDraftImportError('published must be a boolean.'),
    );
  });

  it('merges partial tech stack categories and warns on unsupported categories', () => {
    const result = applyAgentProjectDraftPatch(createActiveProject(), {
      techStack: {
        frontend: [' Astro '],
        database: ['Postgres'],
      },
    });

    expect(result.project.techStack).toEqual({
      frontend: ['Astro'],
      backend: ['Node'],
      data: ['Supabase'],
      infrastructure: ['Netlify'],
    });
    expect(result.warnings).toEqual([
      'Ignored unsupported techStack field "database".',
    ]);
  });

  it('clears supported fields when the payload provides empty values', () => {
    const result = applyAgentProjectDraftPatch(createActiveProject(), {
      title: '',
      features: [],
      challenges: null,
      techStack: {
        frontend: [],
      },
      featuredRank: '',
      projectType: null,
      labels: null,
    });

    expect(result.project).toMatchObject({
      title: '',
      features: [],
      challenges: [],
      techStack: {
        frontend: [],
        backend: ['Node'],
        data: ['Supabase'],
        infrastructure: ['Netlify'],
      },
      featuredRank: '',
      projectType: '',
      labels: [],
    });
  });

  it('serializes safe current project context for existing-project review', () => {
    const activeProject = createActiveProject();
    activeProject.features = [' Current feature ', '', 'NULL'];
    activeProject.metrics = null;
    activeProject.challenges = [
      {
        challenge: ' Current challenge ',
        solution: ' Current solution ',
        result: ' Current result ',
      },
      {
        challenge: '',
        solution: '',
        result: '',
      },
    ];
    activeProject.labels = [' Current ', 'current', 'Portfolio'];
    activeProject.techStack = {
      frontend: [' React ', ''],
      backend: [' Node '],
      data: [' Supabase '],
      infrastructure: [' Netlify '],
      unsupported: ['Ignored'],
    };
    activeProject.featuredRank = '4';

    expect(createAgentProjectDraftReviewContext(activeProject)).toEqual({
      projectContext: {
        id: 42,
        title: 'Current title',
        permalink: 'active-project',
        projectType: '',
        labels: ['Current', 'Portfolio'],
      },
      draft: {
        title: 'Current title',
        description: 'Current card copy',
        overview: 'Current overview',
        role: 'Current role',
        features: ['Current feature'],
        metrics: [],
        challenges: [
          {
            challenge: 'Current challenge',
            solution: 'Current solution',
            result: 'Current result',
          },
        ],
        improvements: ['Current improvement'],
        techStack: {
          frontend: ['React'],
          backend: ['Node'],
          data: ['Supabase'],
          infrastructure: ['Netlify'],
        },
        projectType: '',
        labels: ['Current', 'Portfolio'],
        url: 'https://current.example.test',
        sourceUrl: null,
        writeupUrl: null,
        videoPageUrl: null,
        published: true,
        featuredRank: 4,
      },
    });
  });

  it('omits identity, media, upload, and derived tag fields from exported draft context', () => {
    const contextText = stringifyAgentProjectDraftReviewContext(createActiveProject());
    const context = JSON.parse(contextText);

    expect(context.projectContext).toHaveProperty('id', 42);
    expect(context.projectContext).toHaveProperty('permalink', 'active-project');
    expect(context).not.toHaveProperty('id');
    expect(context.draft).not.toHaveProperty('id');
    expect(context.draft).not.toHaveProperty('permalink');
    expect(context.draft).not.toHaveProperty('sortOrder');
    expect(context.draft).not.toHaveProperty('imageUrl');
    expect(context.draft).not.toHaveProperty('videoUrl');
    expect(context.draft).not.toHaveProperty('architectureImageUrl');
    expect(context.draft).not.toHaveProperty('imageFile');
    expect(context.draft).not.toHaveProperty('videoFile');
    expect(context.draft).not.toHaveProperty('architectureImageFile');
    expect(context.draft).not.toHaveProperty('techTags');
  });
});
