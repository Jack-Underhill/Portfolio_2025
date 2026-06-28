export function createIdleProjectAgentRunState() {
  return {
    status: 'idle',
    error: '',
    notes: [],
    warnings: [],
    appliedFields: [],
    changedFields: [],
    intent: null,
    runPlan: null,
    elapsedMs: null,
  };
}

export function createRunningProjectAgentRunState() {
  return {
    ...createIdleProjectAgentRunState(),
    status: 'running',
  };
}

export function deriveProjectAgentRunControls({
  activeProject,
  agentRun,
  isSaveInFlight = false,
  lastRequest,
} = {}) {
  const status = agentRun?.status || 'idle';
  const isRunning = status === 'running';

  return {
    canClearResult: status !== 'idle' && !isRunning,
    canRetry: Boolean(lastRequest)
      && Boolean(activeProject)
      && !isSaveInFlight
      && !isRunning,
  };
}
