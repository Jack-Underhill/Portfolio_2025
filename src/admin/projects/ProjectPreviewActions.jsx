import { adminUi } from '../../styles/recipes';

function ProjectPreviewActions({
  canCopyContext,
  canPreview,
  canImport,
  canValidate,
  contextPanelId,
  importPanelId,
  isContextOpen,
  isImportOpen,
  isSaveInFlight = false,
  isValidating,
  onToggleContext,
  onToggleImport,
  onPreview,
  onValidate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onToggleContext}
        disabled={!canCopyContext || isSaveInFlight}
        aria-expanded={isContextOpen}
        aria-controls={contextPanelId}
        className={adminUi.secondaryButton}
      >
        Copy draft
      </button>
      <button
        type="button"
        onClick={onToggleImport}
        disabled={!canImport || isSaveInFlight}
        aria-expanded={isImportOpen}
        aria-controls={importPanelId}
        className={adminUi.secondaryButton}
      >
        Import draft
      </button>
      <button
        type="button"
        onClick={onValidate}
        disabled={!canValidate || isValidating || isSaveInFlight}
        aria-busy={isValidating}
        className={adminUi.secondaryButton}
      >
        {isValidating ? 'Validating...' : 'Validate draft'}
      </button>
      <button
        type="button"
        onClick={onPreview}
        disabled={!canPreview}
        className={adminUi.secondaryButton}
      >
        Preview
      </button>
    </div>
  );
}

export default ProjectPreviewActions;
