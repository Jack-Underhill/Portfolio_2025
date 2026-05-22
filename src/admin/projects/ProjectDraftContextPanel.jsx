import { useEffect, useState } from 'react';

import TextAreaInput from '../forms/TextAreaInput';
import { adminUi } from '../../styles/recipes';

async function copyTextToClipboard(text) {
  if (!globalThis.navigator?.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable.');
  }

  await globalThis.navigator.clipboard.writeText(text);
}

function ProjectDraftContextPanel({ contextText, id, onCopySuccess }) {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const descriptionId = `${id}-description`;

  useEffect(() => {
    setError('');
    setStatus('');
  }, [contextText]);

  const resetFeedback = () => {
    setError('');
    setStatus('');
  };

  const handleCopy = async () => {
    resetFeedback();

    try {
      await copyTextToClipboard(contextText);
      setStatus('Copied current project draft context.');
      onCopySuccess?.();
    } catch {
      setError('Clipboard copy failed. Select and copy the JSON manually.');
    }
  };

  return (
    <div id={id} className={`${adminUi.panel} space-y-3 p-4`}>
      <div className="space-y-1">
        <h3 className={adminUi.sectionLabel}>Current project context</h3>
        <p id={descriptionId} className={adminUi.helperText}>
          Copy this read-only context when asking Codex to revise an existing case study.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={adminUi.secondaryButton}
      >
        Copy context
      </button>

      {error && (
        <p className="text-sm text-admin-danger-hover" role="alert">
          {error}
        </p>
      )}

      {status && (
        <p className="text-sm text-admin-accent-text" role="status">
          {status}
        </p>
      )}

      <TextAreaInput
        id={`${id}-payload`}
        label="Current project draft JSON"
        value={contextText}
        onChange={() => {}}
        minRows={8}
        spellCheck={false}
        aria-describedby={descriptionId}
        readOnly
        onFocus={(event) => event.target.select()}
      />
    </div>
  );
}

export default ProjectDraftContextPanel;
