import { adminUi } from '../../styles/recipes';

function ProjectPreviewActions({
  canPreview,
  canValidate,
  isSaveInFlight = false,
  isValidating,
  onPreview,
  onValidate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onPreview}
        disabled={!canPreview}
        className={adminUi.secondaryButton}
      >
        Preview
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
    </div>
  );
}

export default ProjectPreviewActions;
