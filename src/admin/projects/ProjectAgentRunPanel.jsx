import { adminUi } from '../../styles/recipes';

function formatFields(label, fields = []) {
  if (!fields.length) return '';

  return `${label}: ${fields.join(', ')}.`;
}

function ProjectAgentRunPanel({
  agentRun,
  canClearResult = false,
  canRetry = false,
  onClearResult,
  onRetry,
}) {
  const status = agentRun?.status || 'idle';
  const isRunning = status === 'running';
  const shouldShowActions = Boolean(onRetry || onClearResult) && status !== 'idle';
  const appliedFieldsSummary = formatFields('Applied fields', agentRun?.appliedFields);
  const changedFieldsSummary = formatFields('Changed fields', agentRun?.changedFields);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="space-y-3">
      {status === 'running' && (
        <p className="text-sm text-admin-accent-text" role="status">
          Running Codex on the active draft...
        </p>
      )}

      {status === 'failed' && agentRun.error && (
        <p className="text-sm text-admin-danger-hover" role="alert">
          {agentRun.error}
        </p>
      )}

      {status === 'succeeded' && (
        <div className="space-y-1 text-sm text-admin-accent-text" role="status">
          <p>
            Codex returned a patch and applied it to this unsaved draft.
          </p>
          {appliedFieldsSummary && (
            <p>{appliedFieldsSummary}</p>
          )}
          {changedFieldsSummary && (
            <p>{changedFieldsSummary}</p>
          )}
          {agentRun.notes?.map((note, index) => (
            <p key={`note-${index}-${note}`}>{note}</p>
          ))}
          {agentRun.warnings?.map((warning, index) => (
            <p key={`warning-${index}-${warning}`}>{warning}</p>
          ))}
        </div>
      )}

      {shouldShowActions && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRunning || !canRetry}
            className={adminUi.secondaryButton}
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onClearResult}
            disabled={isRunning || !canClearResult}
            className={adminUi.secondaryButton}
          >
            Clear result
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectAgentRunPanel;
