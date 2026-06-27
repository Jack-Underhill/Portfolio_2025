const PROJECT_AGENT_MODES = Object.freeze({
  'revise-current-case-study': Object.freeze({
    id: 'revise-current-case-study',
    label: 'Revise current case study',
    summary: 'Revise the current project draft using the owner instructions.',
    instructions: [
      'Return a minimal patch for the current project draft.',
      'Prioritize the owner instructions while preserving accurate existing context.',
      'Use empty supported fields only when the owner clearly asks to clear content.',
      'Do not produce review-only commentary instead of a patch when a concrete revision is possible.',
    ],
  }),
});

export const PROJECT_AGENT_MODE_IDS = Object.freeze(Object.keys(PROJECT_AGENT_MODES));

export class ProjectAgentModeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProjectAgentModeError';
    this.type = 'invalid_mode';
  }
}

export function getProjectAgentMode(modeId) {
  const normalizedModeId = typeof modeId === 'string' ? modeId.trim() : '';
  const mode = PROJECT_AGENT_MODES[normalizedModeId];

  if (!mode) {
    throw new ProjectAgentModeError(
      `Unsupported project agent mode. Supported modes: ${PROJECT_AGENT_MODE_IDS.join(', ')}.`,
    );
  }

  return mode;
}

export function listProjectAgentModes() {
  return PROJECT_AGENT_MODE_IDS.map((modeId) => PROJECT_AGENT_MODES[modeId]);
}
