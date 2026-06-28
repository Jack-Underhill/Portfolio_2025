import {
  getProjectAgentRunPlan,
  ProjectAgentIntentError,
} from './projectAgentRunPlan.js';

const LEGACY_PROJECT_AGENT_MODE_IDS = Object.freeze(['revise-current-case-study']);

export const PROJECT_AGENT_MODE_IDS = LEGACY_PROJECT_AGENT_MODE_IDS;

export class ProjectAgentModeError extends ProjectAgentIntentError {
  constructor(message) {
    super(message);
    this.name = 'ProjectAgentIntentError';
    this.type = 'invalid_intent';
  }
}

export function getProjectAgentMode(modeId) {
  const normalizedModeId = typeof modeId === 'string' ? modeId.trim() : '';

  if (!LEGACY_PROJECT_AGENT_MODE_IDS.includes(normalizedModeId)) {
    throw new ProjectAgentModeError(
      `Unsupported project agent intent. Supported intents: revise, review.`,
    );
  }

  try {
    const runPlan = getProjectAgentRunPlan(normalizedModeId);

    return {
      ...runPlan,
      instructions: runPlan.responsibilities,
    };
  } catch (error) {
    if (error instanceof ProjectAgentIntentError) {
      throw new ProjectAgentModeError(error.message);
    }

    throw error;
  }
}

export function listProjectAgentModes() {
  return PROJECT_AGENT_MODE_IDS.map(getProjectAgentMode);
}
