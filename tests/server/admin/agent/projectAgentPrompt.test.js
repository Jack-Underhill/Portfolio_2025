import { describe, expect, it } from 'vitest';

import { buildProjectAgentPrompt } from '../../../../server/admin/agent/projectAgentPrompt.js';
import {
  getProjectAgentMode,
  listProjectAgentModes,
} from '../../../../server/admin/agent/projectAgentModes.js';

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
    role: 'Current role',
    features: ['Current feature'],
    metrics: ['Current metric'],
    challenges: [],
    improvements: [],
    techStack: {
      frontend: ['React'],
      backend: ['Node'],
      data: ['Supabase'],
      infrastructure: ['Netlify'],
    },
    projectType: 'personal',
    labels: ['Portfolio'],
    url: '',
    sourceUrl: '',
    writeupUrl: '',
    videoPageUrl: '',
    published: true,
    featuredRank: '',
  },
};

describe('project agent prompt helpers', () => {
  it('exposes the explicit Phase 1 mode map without a generic framework', () => {
    expect(listProjectAgentModes()).toEqual([
      expect.objectContaining({
        id: 'revise-current-case-study',
        label: 'Revise current case study',
      }),
    ]);

    expect(() => getProjectAgentMode('review-current-case-study')).toThrow(
      /Unsupported project agent mode/,
    );
  });

  it('builds a bounded server-side prompt with schema, guardrails, and current draft context', () => {
    const prompt = buildProjectAgentPrompt({
      mode: 'revise-current-case-study',
      instructions: ' Tighten the overview and keep the React evidence. ',
      projectContext,
    });

    expect(prompt).toContain('Mode: revise-current-case-study');
    expect(prompt).toContain('Tighten the overview and keep the React evidence.');
    expect(prompt).toContain('"title": "Current title"');
    expect(prompt).toContain('{ "patch": {}, "notes": [], "warnings": [] }');
    expect(prompt).toContain('title, description, overview, role');
    expect(prompt).toContain('Protected fields that must never be changed or returned:');
    expect(prompt).toContain('id, permalink, sortOrder');
    expect(prompt).toContain('Use fewer strong bullets');
    expect(prompt).toContain('Return only strict JSON');
    expect(prompt).not.toContain('OPENAI_API_KEY');
  });
});
