import { useState } from 'react';

import ProjectDraftContextPanel from './ProjectDraftContextPanel';
import ProjectDraftImportPanel from './ProjectDraftImportPanel';
import ProjectAgentRunPanel from './ProjectAgentRunPanel';
import TextAreaInput from '../forms/TextAreaInput';
import { adminForm, adminUi } from '../../styles/recipes';

const PROJECT_AGENT_INTENT_OPTIONS = Object.freeze([
  {
    value: 'revise',
    label: 'Revise draft',
  },
  {
    value: 'review',
    label: 'Review only',
  },
]);

function getRuntimeModelLabel(runtimeMetadata) {
  const modelLabel = runtimeMetadata?.modelLabel || 'Agent default';
  const reasoningEffort = runtimeMetadata?.modelReasoningEffort?.trim();

  if (!runtimeMetadata?.isModelExplicit || !reasoningEffort) {
    return modelLabel;
  }

  return `${modelLabel}-${reasoningEffort}`;
}

function getRuntimeModelTitle(runtimeMetadata) {
  const source = runtimeMetadata?.modelSourceLabel || 'Agent built-in default';
  const reasoning = runtimeMetadata?.modelReasoningEffort
    ? ` Reasoning: ${runtimeMetadata.modelReasoningEffort}.`
    : '';

  return `${source}.${reasoning}`;
}

function ProjectAgentSection({
  hasActiveProject,
  contextPanelId,
  contextText,
  headingId,
  importPanelId,
  agentRun,
  isContextOpen,
  isImportOpen,
  isSaveInFlight = false,
  runtimeMetadata,
  canClearResult = false,
  canRetry = false,
  onApplyDraft,
  onApplySuccess,
  onClearResult,
  onCopySuccess,
  onRunAgent,
  onRetryAgent,
  onToggleContext,
  onToggleImport,
}) {
  const [intent, setIntent] = useState(PROJECT_AGENT_INTENT_OPTIONS[0].value);
  const [instructions, setInstructions] = useState('');
  const isRunning = agentRun?.status === 'running';
  const hasInstructions = instructions.trim().length > 0;
  const canSubmitRun = hasActiveProject && hasInstructions && !isSaveInFlight && !isRunning;
  const runIntentId = `${headingId}-intent`;
  const instructionsId = `${headingId}-instructions`;
  const runtimeModelLabel = getRuntimeModelLabel(runtimeMetadata);
  const runtimeModelTitle = getRuntimeModelTitle(runtimeMetadata);

  const handleRunAgent = () => {
    if (!canSubmitRun) return;

    onRunAgent?.({
      intent,
      instructions,
    });
  };

  return (
    <div className={adminUi.divider}>
      <div className="space-y-3">
        <h2 id={headingId} className={adminUi.sectionLabel}>Agent</h2>
        <div className={`${adminUi.panel} space-y-3 p-4`}>
          <TextAreaInput
            id={instructionsId}
            label="Instructions"
            value={instructions}
            onChange={setInstructions}
            minRows={3}
            disabled={isSaveInFlight || isRunning}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled
              aria-label="Attach source context to this Agent run (coming soon)"
              title="Source attachments are not available yet"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-control text-admin-text-muted opacity-70 disabled:cursor-not-allowed"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-4.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.75"
              >
                <path d="M10 5v10" />
                <path d="M5 10h10" />
              </svg>
            </button>

            <div className="relative min-w-[1rem] flex-1 sm:w-33 sm:flex-none">
              <select
                id={runIntentId}
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                disabled={isSaveInFlight || isRunning}
                aria-label="Project agent intent"
                title="Project agent intent"
                className={`${adminForm.input} appearance-none pr-10`}
              >
                {PROJECT_AGENT_INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-text-muted"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
              >
                <path d="m6 8 4 4 4-4" />
              </svg>
            </div>

            <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
              <p
                className="min-w-0 max-w-full break-words text-right text-xs text-admin-text-muted"
                title={runtimeModelTitle}
              >
                model: {runtimeModelLabel}
              </p>

              <button
                type="button"
                onClick={handleRunAgent}
                disabled={!canSubmitRun}
                aria-label="Run Agent"
                title="Run Agent"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-accent text-admin-text hover:bg-admin-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-admin-accent"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M10 16V4" />
                  <path d="m5 9 5-5 5 5" />
                </svg>
              </button>
            </div>
          </div>

          <ProjectAgentRunPanel
            agentRun={agentRun}
            canClearResult={canClearResult}
            canRetry={canRetry}
            onClearResult={onClearResult}
            onRetry={onRetryAgent}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleContext}
            disabled={!hasActiveProject || isSaveInFlight}
            aria-expanded={isContextOpen}
            aria-controls={contextPanelId}
            className={adminUi.secondaryButton}
          >
            Copy draft
          </button>
          <button
            type="button"
            onClick={onToggleImport}
            disabled={!hasActiveProject || isSaveInFlight}
            aria-expanded={isImportOpen}
            aria-controls={importPanelId}
            className={adminUi.secondaryButton}
          >
            Import draft
          </button>
        </div>

        {isContextOpen && (
          <ProjectDraftContextPanel
            id={contextPanelId}
            contextText={contextText}
            onCopySuccess={onCopySuccess}
          />
        )}

        {isImportOpen && (
          <ProjectDraftImportPanel
            id={importPanelId}
            isDisabled={isSaveInFlight}
            onApplyDraft={onApplyDraft}
            onApplySuccess={onApplySuccess}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectAgentSection;
