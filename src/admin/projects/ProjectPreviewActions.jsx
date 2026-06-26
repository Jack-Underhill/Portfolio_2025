import { adminUi } from '../../styles/recipes';

function ProjectPreviewActions({
  canCopyContext,
  canImport,
  contextPanelId,
  importPanelId,
  isContextOpen,
  isImportOpen,
  isSaveInFlight = false,
  onToggleContext,
  onToggleImport,
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
    </div>
  );
}

export default ProjectPreviewActions;
