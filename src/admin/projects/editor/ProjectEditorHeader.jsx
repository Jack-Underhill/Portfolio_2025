import { adminUi } from '../../../styles/recipes';

function ProjectEditorHeader({ permalink, sortOrder, published, title, handleFieldChange, onRemove }) {
    const projectName = title || 'current project';

    return (
        <div className="flex justify-between items-center gap-4">
            <div className="min-w-0">
                <p className={adminUi.helperText}>
                    sortOrder: {Number.isFinite(sortOrder) ? sortOrder : 0}
                </p>

                {permalink ? (
                    <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 ${adminUi.helperText}`}>
                        <span className="text-admin-text-faint">Permalink:</span>
                        <code className="px-1 py-0.5 rounded bg-admin-panel border border-admin-border-subtle">
                            {permalink}
                        </code>
                    </div>
                ) : (
                    <p className={`${adminUi.emptyText} mt-1 italic`}>
                        Permalink: (save to generate)
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-admin-text-muted select-none">
                    <input
                        type="checkbox"
                        checked={published !== false}
                        aria-label={`Published state for ${projectName}`}
                        onChange={(e) => handleFieldChange('published', e.target.checked)}
                        className="h-4 w-4 rounded border-admin-checkbox-border bg-admin-panel"
                    />
                    Published
                </label>

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${projectName}`}
                    className={adminUi.dangerLink}
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default ProjectEditorHeader;
