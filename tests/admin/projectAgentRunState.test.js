import { describe, expect, it } from 'vitest';

import {
  createIdleProjectAgentRunState,
  createProjectAgentLastRunRequest,
  createRunningProjectAgentRunState,
  deriveProjectAgentRunControls,
} from '../../src/admin/projects/projectAgentRunState.js';

const ACTIVE_PROJECT = Object.freeze({ id: 'project-1' });
const LAST_REQUEST = Object.freeze({
  intent: 'revise',
  instructions: 'Tighten the case study.',
});
const LIVE_FILE_REQUEST = Object.freeze({
  ...LAST_REQUEST,
  sourceFiles: [
    Object.freeze({
      name: 'notes.md',
      size: 42,
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
  ],
});
const LIVE_RICH_FILE_REQUEST = Object.freeze({
  ...LAST_REQUEST,
  sourceFiles: [
    Object.freeze({
      name: 'report.pdf',
      size: 4096,
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
    Object.freeze({
      name: 'project-bundle.zip',
      size: 8192,
      arrayBuffer: async () => new ArrayBuffer(0),
    }),
  ],
});
const UNAVAILABLE_FILE_REQUEST = Object.freeze({
  ...LAST_REQUEST,
  sourceFiles: [
    Object.freeze({
      name: 'notes.md',
      size: 42,
    }),
  ],
});
const GITHUB_REPO_REQUEST = Object.freeze({
  ...LAST_REQUEST,
  sourceText: '',
  sourceFiles: [],
  githubRepoUrl: 'https://github.com/example/portfolio',
});

describe('project agent run state', () => {
  it('creates serializable idle and running run states', () => {
    expect(createIdleProjectAgentRunState()).toEqual({
      status: 'idle',
      error: '',
      errorDetails: null,
      notes: [],
      warnings: [],
      appliedFields: [],
      changedFields: [],
      intent: null,
      runPlan: null,
      sourceManifest: [],
      validationPreflight: null,
      elapsedMs: null,
    });

    expect(createRunningProjectAgentRunState()).toEqual({
      status: 'running',
      error: '',
      errorDetails: null,
      notes: [],
      warnings: [],
      appliedFields: [],
      changedFields: [],
      intent: null,
      runPlan: null,
      sourceManifest: [],
      validationPreflight: null,
      elapsedMs: null,
    });
  });

  it('allows clear only for completed visible results', () => {
    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: createIdleProjectAgentRunState(),
      lastRequest: LAST_REQUEST,
    }).canClearResult).toBe(false);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: createRunningProjectAgentRunState(),
      lastRequest: LAST_REQUEST,
    }).canClearResult).toBe(false);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: LAST_REQUEST,
    }).canClearResult).toBe(true);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'failed' },
      lastRequest: LAST_REQUEST,
    }).canClearResult).toBe(true);
  });

  it('allows retry only when a prior request can run against the current active draft', () => {
    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: LAST_REQUEST,
    }).canRetry).toBe(true);

    expect(deriveProjectAgentRunControls({
      activeProject: null,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: LAST_REQUEST,
    }).canRetry).toBe(false);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: null,
    }).canRetry).toBe(false);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: createRunningProjectAgentRunState(),
      lastRequest: LAST_REQUEST,
    }).canRetry).toBe(false);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'failed' },
      isSaveInFlight: true,
      lastRequest: LAST_REQUEST,
    }).canRetry).toBe(false);
  });

  it('allows retry for live source file references and blocks unavailable file references', () => {
    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: LIVE_FILE_REQUEST,
    }).canRetry).toBe(true);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: LIVE_RICH_FILE_REQUEST,
    }).canRetry).toBe(true);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: UNAVAILABLE_FILE_REQUEST,
    }).canRetry).toBe(false);
  });

  it('creates retry requests that preserve GitHub repo URLs and normalize source files', () => {
    expect(createProjectAgentLastRunRequest({
      intent: 'review',
      instructions: 'Review repo evidence.',
      sourceText: ' ',
      sourceFiles: null,
      githubRepoUrl: 'https://github.com/example/portfolio',
    })).toEqual({
      intent: 'review',
      instructions: 'Review repo evidence.',
      sourceText: ' ',
      sourceFiles: [],
      githubRepoUrl: 'https://github.com/example/portfolio',
    });
  });

  it('allows retry for repo-backed requests while preserving file-object safeguards', () => {
    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: GITHUB_REPO_REQUEST,
    }).canRetry).toBe(true);

    expect(deriveProjectAgentRunControls({
      activeProject: ACTIVE_PROJECT,
      agentRun: { ...createIdleProjectAgentRunState(), status: 'succeeded' },
      lastRequest: {
        ...UNAVAILABLE_FILE_REQUEST,
        githubRepoUrl: 'https://github.com/example/portfolio',
      },
    }).canRetry).toBe(false);
  });
});
