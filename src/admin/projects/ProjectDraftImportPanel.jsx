import { useState } from 'react';

import TextAreaInput from '../forms/TextAreaInput';
import { AgentProjectDraftImportError } from '../../domain/projects/agentDraft';
import { adminUi } from '../../styles/recipes';

function formatAppliedFields(fields) {
  if (!fields.length) return 'No supported fields were present in the payload.';

  return `Applied ${fields.length} ${fields.length === 1 ? 'field' : 'fields'}: ${fields.join(', ')}.`;
}

function ProjectDraftImportPanel({ id, isDisabled = false, onApplyDraft, onApplySuccess }) {
  const [payloadText, setPayloadText] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [warnings, setWarnings] = useState([]);
  const descriptionId = `${id}-description`;

  const resetFeedback = () => {
    setError('');
    setStatus('');
    setWarnings([]);
  };

  const handleApply = () => {
    resetFeedback();

    try {
      const result = onApplyDraft(payloadText);
      setStatus(formatAppliedFields(result.appliedFields));
      setWarnings(result.warnings);
      onApplySuccess?.();
    } catch (applyError) {
      setError(
        applyError instanceof AgentProjectDraftImportError
          ? applyError.message
          : 'Project draft import failed.',
      );
    }
  };

  const handleClear = () => {
    setPayloadText('');
    resetFeedback();
  };

  return (
    <div id={id} className={`${adminUi.panel} space-y-3 p-4`}>
      <div className="space-y-1">
        <h3 className={adminUi.sectionLabel}>Project draft import</h3>
        <p id={descriptionId} className={adminUi.helperText}>
          Paste a supported JSON payload or fenced JSON block. Applying updates only this local draft.
        </p>
      </div>

      <TextAreaInput
        id={`${id}-payload`}
        label="Project draft payload"
        value={payloadText}
        onChange={(value) => {
          setPayloadText(value);
          resetFeedback();
        }}
        minRows={8}
        spellCheck={false}
        aria-describedby={descriptionId}
        disabled={isDisabled}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={isDisabled || !payloadText.trim()}
          className={adminUi.secondaryButton}
        >
          Apply draft
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!payloadText && !error && !status && !warnings.length}
          className={adminUi.smallSecondaryButton}
        >
          Clear
        </button>
      </div>

      {error && (
        <p className="text-sm text-admin-danger-hover" role="alert">
          {error}
        </p>
      )}

      {(status || warnings.length > 0) && (
        <div className="space-y-1 text-sm text-admin-accent-text" role="status">
          {status && <p>{status}</p>}
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDraftImportPanel;
