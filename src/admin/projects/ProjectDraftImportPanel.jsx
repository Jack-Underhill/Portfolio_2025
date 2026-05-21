import { useState } from 'react';

import TextAreaInput from '../forms/TextAreaInput';
import { AgentProjectDraftImportError } from '../../domain/projects/agentDraft';
import { adminUi } from '../../styles/recipes';

function formatAppliedFields(fields) {
  if (!fields.length) return 'No supported fields were present in the payload.';

  return `Applied ${fields.length} ${fields.length === 1 ? 'field' : 'fields'}: ${fields.join(', ')}.`;
}

function ProjectDraftImportPanel({ id, onApplyDraft }) {
  const [payloadText, setPayloadText] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [warnings, setWarnings] = useState([]);

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
        <h5 className={adminUi.helperText}>
          Paste a supported JSON payload or fenced JSON block. Applying updates only this local draft.
        </h5>
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
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={!payloadText.trim()}
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
