import { PROJECT_TYPE_OPTIONS } from '../../domain/projects/constants';

const PROJECT_TYPE_LABELS = new Map(
    PROJECT_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
);

function ProjectClassificationPills({ projectType, labels }) {
    const typeLabel = PROJECT_TYPE_LABELS.get(projectType);
    const displayLabel = Array.isArray(labels)
        ? labels.find((label) => typeof label === 'string' && label.trim())
        : undefined;

    if (!typeLabel && !displayLabel) {
        return null;
    }

    return (
        <div className="flex min-h-6 min-w-0 items-center gap-2 overflow-hidden px-3 pt-3 lg:px-4">
            {typeLabel && (
                <span className="shrink-0 rounded-full border border-button-border/60 bg-card-att px-2.5 py-0.5 text-xs font-semibold text-text">
                    {typeLabel}
                </span>
            )}

            {displayLabel && (
                <span className="min-w-0 max-w-full truncate rounded-full border border-card-border bg-page-elevated px-2.5 py-0.5 text-xs font-medium text-text/75">
                    {displayLabel}
                </span>
            )}
        </div>
    );
}

export default ProjectClassificationPills;
