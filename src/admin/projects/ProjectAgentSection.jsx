import { useRef, useState } from 'react';

import ProjectDraftContextPanel from './ProjectDraftContextPanel';
import ProjectDraftImportPanel from './ProjectDraftImportPanel';
import ProjectAgentRunPanel from './ProjectAgentRunPanel';
import ProjectAgentSourceInputs from './ProjectAgentSourceInputs';
import {
  createFailedProjectAgentSourcePreview,
  createIdleProjectAgentSourcePreview,
  createLoadingProjectAgentSourcePreview,
  createProjectAgentSourceInputSignature,
  createSucceededProjectAgentSourcePreview,
  hasProjectAgentSourceInput,
} from './projectAgentSourcePreviewState';
import TextAreaInput from '../forms/TextAreaInput';
import { previewProjectAgentSources } from '../api/adminClient';
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
  const [sourceText, setSourceText] = useState('');
  const [sourceFiles, setSourceFiles] = useState([]);
  const [sourcePreview, setSourcePreview] = useState(createIdleProjectAgentSourcePreview);
  const sourceInputSignature = createProjectAgentSourceInputSignature({ sourceText, sourceFiles });
  const sourceInputSignatureRef = useRef(sourceInputSignature);
  sourceInputSignatureRef.current = sourceInputSignature;
  const isRunning = agentRun?.status === 'running';
  const isPreviewingSources = sourcePreview.status === 'loading';
  const isAgentInputDisabled = isSaveInFlight || isRunning || isPreviewingSources;
  const hasInstructions = instructions.trim().length > 0;
  const hasSourceText = sourceText.trim().length > 0;
  const hasSourceFiles = sourceFiles.length > 0;
  const hasRunnableInput = hasInstructions || hasSourceText || hasSourceFiles;
  const hasPreviewableSource = hasProjectAgentSourceInput({ sourceText, sourceFiles });
  const canPreviewSources = hasActiveProject
    && hasPreviewableSource
    && !isSaveInFlight
    && !isRunning
    && !isPreviewingSources;
  const canSubmitRun = hasActiveProject
    && hasRunnableInput
    && !isSaveInFlight
    && !isRunning
    && !isPreviewingSources;
  const runIntentId = `${headingId}-intent`;
  const instructionsId = `${headingId}-instructions`;
  const sourceTextId = `${headingId}-source-material`;
  const sourceFilesId = `${headingId}-source-files`;
  const runtimeModelLabel = getRuntimeModelLabel(runtimeMetadata);
  const runtimeModelTitle = getRuntimeModelTitle(runtimeMetadata);

  const clearSourcePreview = () => {
    setSourcePreview(createIdleProjectAgentSourcePreview);
  };

  const handleSourceTextChange = (value) => {
    setSourceText(value);
    clearSourcePreview();
  };

  const handleAddSourceFiles = (files) => {
    setSourceFiles((currentFiles) => [...currentFiles, ...files]);
    clearSourcePreview();
  };

  const handleRemoveSourceFile = (fileIndex) => {
    setSourceFiles((currentFiles) => currentFiles.filter((_, index) => index !== fileIndex));
    clearSourcePreview();
  };

  const handlePreviewSources = async () => {
    if (!canPreviewSources) return;

    const requestSignature = sourceInputSignatureRef.current;
    setSourcePreview(createLoadingProjectAgentSourcePreview(requestSignature));

    try {
      const result = await previewProjectAgentSources({
        sourceText,
        sourceFiles,
      });

      if (sourceInputSignatureRef.current !== requestSignature) return;

      setSourcePreview(createSucceededProjectAgentSourcePreview(result, requestSignature));
    } catch (error) {
      if (sourceInputSignatureRef.current !== requestSignature) return;

      setSourcePreview(createFailedProjectAgentSourcePreview(error, requestSignature));
    }
  };

  const handleRunAgent = () => {
    if (!canSubmitRun) return;

    onRunAgent?.({
      intent,
      instructions,
      sourceText,
      sourceFiles,
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
            disabled={isAgentInputDisabled}
          />

          <TextAreaInput
            id={sourceTextId}
            label="Source material"
            value={sourceText}
            onChange={handleSourceTextChange}
            minRows={2}
            disabled={isAgentInputDisabled}
            placeholder="Paste notes, reports, metrics, or other evidence."
          />

          <div className="flex flex-wrap items-center gap-2">
            <ProjectAgentSourceInputs
              id={sourceFilesId}
              sourceFiles={sourceFiles}
              disabled={isAgentInputDisabled}
              sourcePreview={sourcePreview}
              canPreviewSources={canPreviewSources}
              isPreviewingSources={isPreviewingSources}
              onAddFiles={handleAddSourceFiles}
              onRemoveFile={handleRemoveSourceFile}
              onPreviewSources={handlePreviewSources}
            />

            <div className="relative min-w-[1rem] flex-1 sm:w-33 sm:flex-none">
              <select
                id={runIntentId}
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                disabled={isAgentInputDisabled}
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
