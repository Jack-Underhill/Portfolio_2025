import { describe, expect, it } from 'vitest';

import { buildProjectAgentPrompt } from '../../../../server/admin/agent/projectAgentPrompt.js';
import {
  createProjectAgentRunPlan,
  getProjectAgentIntent,
  isProjectAgentDraftEffectivelyEmpty,
  listProjectAgentIntents,
  PROJECT_AGENT_INTENT_IDS,
  PROJECT_AGENT_RUN_PLAN_IDS,
} from '../../../../server/admin/agent/projectAgentRunPlan.js';

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
  it('exposes the supported owner intents without a generic framework', () => {
    expect(PROJECT_AGENT_INTENT_IDS).toEqual(['revise', 'review']);
    expect(listProjectAgentIntents()).toEqual([
      expect.objectContaining({
        id: 'revise',
        label: 'Revise draft',
      }),
      expect.objectContaining({
        id: 'review',
        label: 'Review only',
      }),
    ]);

    expect(getProjectAgentIntent(' review ')).toEqual(expect.objectContaining({ id: 'review' }));
    expect(() => getProjectAgentIntent('polish')).toThrow(/Unsupported project agent intent/);
  });

  it('defines the expected derived run plans', () => {
    expect(PROJECT_AGENT_RUN_PLAN_IDS).toEqual([
      'generate-new-case-study',
      'revise-current-case-study',
      'revise-with-source-context',
      'review-current-case-study',
    ]);
  });

  it('derives generate-new-case-study for revise on an effectively empty draft', () => {
    const runPlan = createProjectAgentRunPlan({
      intent: 'revise',
      projectContext: {
        draft: {
          title: '',
          description: '',
          overview: '',
          role: '',
          features: [],
          metrics: [],
          challenges: [],
          improvements: [],
          techStack: {
            frontend: [],
            backend: [],
            data: [],
            infrastructure: [],
          },
          projectType: 'personal',
          labels: [],
          published: true,
          featuredRank: '',
        },
      },
    });

    expect(isProjectAgentDraftEffectivelyEmpty({
      draft: {
        projectType: 'personal',
        published: true,
        featuredRank: '',
        techStack: { frontend: [], backend: [] },
      },
    })).toBe(true);
    expect(runPlan).toEqual(expect.objectContaining({ id: 'generate-new-case-study' }));
  });

  it('derives revise-current-case-study for revise on a non-empty draft', () => {
    expect(createProjectAgentRunPlan({
      intent: 'revise',
      projectContext,
    })).toEqual(expect.objectContaining({ id: 'revise-current-case-study' }));
  });

  it('derives review-current-case-study for review regardless of draft content', () => {
    expect(createProjectAgentRunPlan({
      intent: 'review',
      projectContext: { draft: {} },
    })).toEqual(expect.objectContaining({ id: 'review-current-case-study' }));

    expect(createProjectAgentRunPlan({
      intent: 'review',
      projectContext,
    })).toEqual(expect.objectContaining({ id: 'review-current-case-study' }));
  });

  it('keeps revise-with-source-context planned behind the source context flag', () => {
    expect(createProjectAgentRunPlan({
      intent: 'revise',
      projectContext,
      hasSourceContext: true,
    })).toEqual(expect.objectContaining({ id: 'revise-with-source-context' }));
  });

  it('builds a revise prompt with schema, guardrails, and current draft context', () => {
    const prompt = buildProjectAgentPrompt({
      intent: 'revise',
      instructions: ' Tighten the overview and keep the React evidence. ',
      projectContext,
    });

    expect(prompt).toContain('Owner intent: revise (Revise draft)');
    expect(prompt).toContain('Derived run plan: revise-current-case-study');
    expect(prompt).toContain('Return a supported patch that directly implements the owner instructions.');
    expect(prompt).toContain('Tighten the overview and keep the React evidence.');
    expect(prompt).toContain('"title": "Current title"');
    expect(prompt).toContain('{ "patch": {}, "notes": [], "warnings": [] }');
    expect(prompt).toContain('title, description, overview, role');
    expect(prompt).toContain('Protected fields that must never be changed or returned:');
    expect(prompt).toContain('id, permalink, sortOrder');
    expect(prompt).toContain('Use fewer strong bullets');
    expect(prompt).toContain('Keep overview and role plain-language');
    expect(prompt).toContain('Return only strict JSON');
    expect(prompt).not.toContain('OPENAI_API_KEY');
  });

  it('builds a review prompt that requires analysis-only output and an empty patch', () => {
    const prompt = buildProjectAgentPrompt({
      intent: 'review',
      instructions: 'Find stale claims and weak evidence.',
      projectContext,
    });

    expect(prompt).toContain('Owner intent: review (Review only)');
    expect(prompt).toContain('Derived run plan: review-current-case-study');
    expect(prompt).toContain('Analyze only.');
    expect(prompt).toContain('Return patch as exactly {}.');
    expect(prompt).toContain('Do not rewrite fields, even when issues are found.');
    expect(prompt).toContain('findings, missing evidence, contradictions, bloat, stale content');
    expect(prompt).toContain('{ "patch": {}, "notes": [], "warnings": [] }');
    expect(prompt).not.toContain('OPENAI_API_KEY');
  });

  it('builds a generate-new-case-study prompt for an empty revise draft', () => {
    const prompt = buildProjectAgentPrompt({
      intent: 'revise',
      instructions: 'Draft a new case study about the scheduling app.',
      projectContext: {
        projectContext: {},
        draft: {
          title: '',
          description: '',
          overview: '',
          role: '',
          features: [],
          metrics: [],
          challenges: [],
          improvements: [],
          techStack: {
            frontend: [],
            backend: [],
            data: [],
            infrastructure: [],
          },
          projectType: 'personal',
          labels: [],
          published: true,
          featuredRank: '',
        },
      },
    });

    expect(prompt).toContain('Derived run plan: generate-new-case-study');
    expect(prompt).toContain('Treat the active draft as a fresh working draft.');
    expect(prompt).toContain('Do not invent URLs, results, metrics, or facts not supported by instructions or context.');
  });
});
