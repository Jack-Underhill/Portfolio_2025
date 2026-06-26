import { adminUi } from '../../styles/recipes';

function ProjectWorkspaceActions({
  canPreview,
  canValidate,
  isSaveInFlight = false,
  isValidating,
  onAddProject,
  onPreview,
  onValidate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onAddProject}
        aria-label="Add project"
        className={adminUi.secondaryButton}
      >
        + Add Project
      </button>
      <button
        type="button"
        onClick={onValidate}
        disabled={!canValidate || isValidating || isSaveInFlight}
        aria-busy={isValidating}
        className={adminUi.secondaryButton}
      >
        {isValidating ? 'Validating...' : 'Validate Projects'}
      </button>
      <button
        type="button"
        onClick={onPreview}
        disabled={!canPreview}
        className={adminUi.secondaryButton}
      >
        Preview Case Study
      </button>
    </div>
  );
}

export default ProjectWorkspaceActions;
