import { adminUi } from '../../styles/recipes';

function ProjectPreviewActions({ canPreview, onPreview }) {
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
    </div>
  );
}

export default ProjectPreviewActions;
