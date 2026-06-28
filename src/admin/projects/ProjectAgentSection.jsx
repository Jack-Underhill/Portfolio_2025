import { useState } from 'react';

import ProjectDraftContextPanel from './ProjectDraftContextPanel';
import ProjectDraftImportPanel from './ProjectDraftImportPanel';
import TextAreaInput from '../forms/TextAreaInput';
import FieldLabel from '../forms/FieldLabel';
import { adminForm, adminUi } from '../../styles/recipes';

const PROJECT_AGENT_MODE_OPTIONS = Object.freeze([
  {
    value: 'revise-current-case-study',
    label: 'Revise current case study',
  },
]);

function formatFields(label, fields = []) {
  if (!fields.length) return '';

  return `${label}: ${fields.join(', ')}.`;
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
  onApplyDraft,
  onApplySuccess,
  onCopySuccess,
  onRunAgent,
  onToggleContext,
  onToggleImport,
}) {
  const [mode, setMode] = useState(PROJECT_AGENT_MODE_OPTIONS[0].value);
  const [instructions, setInstructions] = useState('');
  const isRunning = agentRun?.status === 'running';
  const hasInstructions = instructions.trim().length > 0;
  const canSubmitRun = hasActiveProject && hasInstructions && !isSaveInFlight && !isRunning;
  const runModeId = `${headingId}-mode`;
  const instructionsId = `${headingId}-instructions`;
  const appliedFieldsSummary = formatFields('Applied fields', agentRun?.appliedFields);
  const changedFieldsSummary = formatFields('Changed fields', agentRun?.changedFields);

  const handleRunAgent = () => {
    if (!canSubmitRun) return;

    onRunAgent?.({
      mode,
      instructions,
    });
  };

  return (
    <div className={adminUi.divider}>
      <div className="space-y-3">
        <h2 id={headingId} className={adminUi.sectionLabel}>Agent</h2>
        <div className={`${adminUi.panel} space-y-3 p-4`}>
          <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr]">
            <div className="space-y-1">
              <FieldLabel htmlFor={runModeId}>
                Mode
              </FieldLabel>
              <select
                id={runModeId}
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                disabled={isSaveInFlight || isRunning}
                className={adminForm.input}
              >
                {PROJECT_AGENT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <TextAreaInput
              id={instructionsId}
              label="Instructions"
              value={instructions}
              onChange={setInstructions}
              minRows={3}
              disabled={isSaveInFlight || isRunning}
            />
          </div>

          <button
            type="button"
            onClick={handleRunAgent}
            disabled={!canSubmitRun}
            className={adminUi.primaryButton}
          >
            {isRunning ? 'Running Codex...' : 'Run Codex'}
          </button>

          {agentRun?.status === 'running' && (
            <p className="text-sm text-admin-accent-text" role="status">
              Running Codex on the active draft...
            </p>
          )}

          {agentRun?.status === 'failed' && agentRun.error && (
            <p className="text-sm text-admin-danger-hover" role="alert">
              {agentRun.error}
            </p>
          )}

          {agentRun?.status === 'succeeded' && (
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
              {agentRun.notes?.map((note) => (
                <p key={`note-${note}`}>{note}</p>
              ))}
              {agentRun.warnings?.map((warning) => (
                <p key={`warning-${warning}`}>{warning}</p>
              ))}
            </div>
          )}
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
