export function createIdleProjectAgentRunState() {
  return {
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
    elapsedMs: null,
  };
}

export function createRunningProjectAgentRunState() {
  return {
    ...createIdleProjectAgentRunState(),
    status: 'running',
  };
}

function isRetryableSourceFile(file) {
  return Boolean(file)
    && typeof file.name === 'string'
    && Number.isFinite(file.size)
    && typeof file.arrayBuffer === 'function';
}

function hasRetryableSourceFiles(lastRequest) {
  const sourceFiles = lastRequest?.sourceFiles;

  if (!Array.isArray(sourceFiles) || sourceFiles.length === 0) return true;

  return sourceFiles.every(isRetryableSourceFile);
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
      && !isRunning
      && hasRetryableSourceFiles(lastRequest),
  };
}
