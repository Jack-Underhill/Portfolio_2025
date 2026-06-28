import { useState } from 'react';

import ProjectDraftContextPanel from './ProjectDraftContextPanel';
import ProjectDraftImportPanel from './ProjectDraftImportPanel';
import ProjectAgentRunPanel from './ProjectAgentRunPanel';
import TextAreaInput from '../forms/TextAreaInput';
import FieldLabel from '../forms/FieldLabel';
import { adminForm, adminUi } from '../../styles/recipes';

const PROJECT_AGENT_MODE_OPTIONS = Object.freeze([
  {
    value: 'revise-current-case-study',
    label: 'Revise current case study',
  },
]);

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

          <ProjectAgentRunPanel agentRun={agentRun} />
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
