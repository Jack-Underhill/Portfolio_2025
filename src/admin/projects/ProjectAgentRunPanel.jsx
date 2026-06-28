import { useEffect, useRef } from 'react';

import { adminUi } from '../../styles/recipes';

function formatFieldName(field) {
  return String(field)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function normalizeItems(items = []) {
  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function formatElapsedMs(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return '';

  if (elapsedMs < 1000) return `${Math.round(elapsedMs)} ms`;

  return `${(elapsedMs / 1000).toFixed(elapsedMs < 10000 ? 1 : 0)} s`;
}

function getFailureMessage(error) {
  const message = String(error || '').trim();
  if (!message) return 'Codex could not complete the run.';

  const firstLine = message.split(/\r?\n/)[0].trim();
  if (!firstLine || firstLine.length > 180) {
    return 'Codex could not complete the run. Check the admin server log for details.';
  }

  return firstLine;
}

function FieldSummary({ label, fields }) {
  const normalizedFields = normalizeItems(fields);

  if (!normalizedFields.length) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-admin-text-subtle">
        {label}
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label={label}>
        {normalizedFields.map((field) => (
          <li
            key={field}
            className="rounded-md border border-admin-border-subtle bg-admin-row px-2 py-1 text-xs text-admin-text-muted"
          >
            {formatFieldName(field)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageGroup({ label, items, tone = 'default' }) {
  const normalizedItems = normalizeItems(items);

  if (!normalizedItems.length) return null;

  const toneClasses = tone === 'warning'
    ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
    : 'border-admin-border-subtle bg-admin-row text-admin-text-muted';

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-admin-text-subtle">
        {label}
      </p>
      <ul className="space-y-1.5">
        {normalizedItems.map((item, index) => (
          <li
            key={`${label}-${index}-${item}`}
            className={`rounded-md border px-2.5 py-2 text-xs leading-5 ${toneClasses}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
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
  const elapsedSummary = formatElapsedMs(agentRun?.elapsedMs);
  const failureMessage = getFailureMessage(agentRun?.error);
  const headingRef = useRef(null);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    if (previousStatus === 'running' && (status === 'succeeded' || status === 'failed')) {
      headingRef.current?.focus();
    }
  }, [status]);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-admin-border-subtle pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="text-sm font-semibold text-admin-text outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text"
          >
            Run result
          </h3>
          {elapsedSummary && (
            <p className={adminUi.helperText}>
              Completed in {elapsedSummary}
            </p>
          )}
        </div>

        {shouldShowActions && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRunning || !canRetry}
              aria-label="Retry last Codex run against the current draft"
              className={adminUi.secondaryButton}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onClearResult}
              disabled={isRunning || !canClearResult}
              aria-label="Clear Codex run result"
              className={adminUi.secondaryButton}
            >
              Clear result
            </button>
          </div>
        )}
      </div>

      {status === 'running' && (
        <p className="text-sm text-admin-accent-text" role="status" aria-live="polite">
          Running Codex on the active draft...
        </p>
      )}

      {status === 'failed' && (
        <div className="space-y-1 text-sm" role="alert">
          <p className="font-medium text-admin-danger-hover">
            Codex did not update the draft.
          </p>
          <p className="text-admin-text-muted">
            {failureMessage}
          </p>
        </div>
      )}

      {status === 'succeeded' && (
        <div className="space-y-3 text-sm" role="status" aria-live="polite">
          <div className="space-y-1">
            <p className="font-medium text-admin-accent-text">
              Codex applied a patch to the active unsaved draft.
            </p>
            <p className="text-admin-text-muted">
              Review and preview the draft before saving; clearing this result only hides the summary.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FieldSummary label="Changed fields" fields={agentRun?.changedFields} />
            <FieldSummary label="Applied fields" fields={agentRun?.appliedFields} />
          </div>

          <MessageGroup label="Notes" items={agentRun?.notes} />
          <MessageGroup label="Warnings" items={agentRun?.warnings} tone="warning" />
        </div>
      )}
    </div>
  );
}

export default ProjectAgentRunPanel;
