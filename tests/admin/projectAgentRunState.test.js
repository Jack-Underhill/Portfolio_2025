import { describe, expect, it } from 'vitest';

import {
  createIdleProjectAgentRunState,
  createRunningProjectAgentRunState,
  deriveProjectAgentRunControls,
} from '../../src/admin/projects/projectAgentRunState.js';

const ACTIVE_PROJECT = Object.freeze({ id: 'project-1' });
const LAST_REQUEST = Object.freeze({
  intent: 'revise',
  instructions: 'Tighten the case study.',
});

describe('project agent run state', () => {
  it('creates serializable idle and running run states', () => {
    expect(createIdleProjectAgentRunState()).toEqual({
      status: 'idle',
      error: '',
      notes: [],
      warnings: [],
      appliedFields: [],
      changedFields: [],
      intent: null,
      runPlan: null,
      elapsedMs: null,
    });

    expect(createRunningProjectAgentRunState()).toEqual({
      status: 'running',
      error: '',
      notes: [],
      warnings: [],
      appliedFields: [],
      changedFields: [],
      intent: null,
      runPlan: null,
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
});
