import { describe, expect, it } from 'vitest';

import { createProjectAgentValidationPreflight } from '../../../../server/admin/agent/projectAgentValidationPreflight.js';

const projectContext = {
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
    overview: 'Current overview',
    role: 'Full-stack engineer',
    features: ['Draft feature'],
    metrics: ['Draft metric'],
    challenges: [
      {
        challenge: 'Validation drift',
        solution: 'Reuse server rules',
        result: 'Safer saves',
      },
    ],
    improvements: ['Keep manual save gate'],
    techStack: {
      frontend: ['React'],
      backend: [],
      data: [],
      infrastructure: [],
    },
    projectType: 'personal',
    labels: ['Portfolio'],
    url: 'https://current.example.test',
    sourceUrl: '',
    writeupUrl: '',
    videoPageUrl: '',
    published: true,
    featuredRank: '',
  },
};

describe('project agent validation preflight', () => {
  it('applies a revise patch to a temporary draft and returns passed when validation accepts it', () => {
    const capturedPayloads = [];

    const result = createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext,
      patch: {
        title: ' Revised case study ',
        url: ' https://revised.example.test ',
        techStack: {
          backend: ['Node.js'],
        },
      },
      validateProjects: (payload) => {
        capturedPayloads.push(payload);
        return payload;
      },
    });

    expect(result).toEqual({
      status: 'passed',
      message: 'Validation preflight passed for the revised draft.',
      errors: [],
    });
    expect(capturedPayloads).toEqual([
      {
        projectBio: '',
        projects: [
          expect.objectContaining({
            id: 42,
            permalink: 'current-title',
            title: 'Revised case study',
            url: 'https://revised.example.test',
            techStack: {
              frontend: ['React'],
              backend: ['Node.js'],
              data: [],
              infrastructure: [],
            },
          }),
        ],
      },
    ]);
  });

  it('returns failed with concise validation errors when the temporary draft has a bad URL', () => {
    const result = createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext,
      patch: {
        url: 'not a url',
      },
    });

    expect(result).toEqual({
      status: 'failed',
      message: 'Validation preflight found an issue to fix before Save.',
      errors: ['project 1 live URL must be a valid URL'],
    });
  });

  it('returns failed when the temporary draft exceeds an existing field length limit', () => {
    const result = createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext,
      patch: {
        overview: 'x'.repeat(6001),
      },
    });

    expect(result).toEqual({
      status: 'failed',
      message: 'Validation preflight found an issue to fix before Save.',
      errors: ['project 1 overview must be 6000 characters or fewer'],
    });
  });

  it('returns failed when the temporary draft has an invalid list shape', () => {
    const result = createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext: {
        ...projectContext,
        draft: {
          ...projectContext.draft,
          features: 'not an array',
        },
      },
      patch: {
        title: 'Still revised',
      },
    });

    expect(result).toEqual({
      status: 'failed',
      message: 'Validation preflight found an issue to fix before Save.',
      errors: ['project 1 features must be an array'],
    });
  });

  it('returns skipped for review-only and patchless runs', () => {
    expect(createProjectAgentValidationPreflight({
      intent: 'review',
      projectContext,
      patch: {
        title: 'Should not validate as revised',
      },
    })).toEqual({
      status: 'skipped',
      message: 'Validation preflight skipped for review-only runs.',
      errors: [],
    });

    expect(createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext,
      patch: {},
    })).toEqual({
      status: 'skipped',
      message: 'Validation preflight skipped because no revised draft patch was returned.',
      errors: [],
    });
  });

  it('keeps unexpected helper failures browser-safe and non-throwing', () => {
    const result = createProjectAgentValidationPreflight({
      intent: 'revise',
      projectContext,
      patch: {
        title: 'Revised case study',
      },
      validateProjects: () => {
        throw new Error('C:\\Temp\\secret\\stack trace details');
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      message: 'Validation preflight was skipped because the revised draft could not be checked.',
      errors: [],
    });
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(JSON.stringify(result)).not.toContain('stack trace');
  });
});
