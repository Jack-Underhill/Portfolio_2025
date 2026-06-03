import { useEffect, useMemo, useState } from 'react';
import { PROJECT_TYPE_OPTIONS } from '../../domain/projects/constants';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const PROJECT_TYPE_LABELS = new Map(
    PROJECT_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
);

const LABEL_ROTATION_INTERVAL_MS = 4000;
const LABEL_CROSSFADE_DURATION_MS = 300;

function ProjectClassificationPills({ projectType, labels }) {
    const typeLabel = PROJECT_TYPE_LABELS.get(projectType);
    const displayLabels = useMemo(
        () => Array.isArray(labels)
            ? labels.filter((label) => typeof label === 'string' && label.trim())
            : [],
        [labels],
    );
    const prefersReducedMotion = usePrefersReducedMotion();
    const [activeLabelIndex, setActiveLabelIndex] = useState(0);
    const [outgoingLabel, setOutgoingLabel] = useState();
    const [isCrossfading, setIsCrossfading] = useState(false);
    const shouldCycleLabels = displayLabels.length > 1 && !prefersReducedMotion;
    const displayLabel = displayLabels[activeLabelIndex];

    useEffect(() => {
        let crossfadeFrameId;
        let settleFrameId;
        let crossfadeTimeoutId;
        const clearCrossfadeLifecycle = () => {
            window.cancelAnimationFrame(crossfadeFrameId);
            window.cancelAnimationFrame(settleFrameId);
            window.clearTimeout(crossfadeTimeoutId);
        };

        setActiveLabelIndex(0);
        setOutgoingLabel(undefined);
        setIsCrossfading(false);

        if (displayLabels.length < 2 || prefersReducedMotion) {
            return undefined;
        }

        let nextLabelIndex = 0;
        const rotationIntervalId = window.setInterval(() => {
            clearCrossfadeLifecycle();

            const previousLabel = displayLabels[nextLabelIndex];
            nextLabelIndex = (nextLabelIndex + 1) % displayLabels.length;

            setOutgoingLabel(previousLabel);
            setActiveLabelIndex(nextLabelIndex);
            setIsCrossfading(false);

            crossfadeFrameId = window.requestAnimationFrame(() => {
                settleFrameId = window.requestAnimationFrame(() => {
                    setIsCrossfading(true);
                    crossfadeTimeoutId = window.setTimeout(() => {
                        setOutgoingLabel(undefined);
                        setIsCrossfading(false);
                    }, LABEL_CROSSFADE_DURATION_MS);
                });
            });
        }, LABEL_ROTATION_INTERVAL_MS);

        return () => {
            window.clearInterval(rotationIntervalId);
            clearCrossfadeLifecycle();
        };
    }, [displayLabels, prefersReducedMotion]);

    if (!typeLabel && !displayLabel) {
        return null;
    }

    return (
        <div className="flex min-h-6 min-w-0 items-center gap-2 overflow-hidden mt-4 px-3 lg:px-4 text-xs 2xl:text-sm">
            {typeLabel && (
                <span className="shrink-0 rounded-full border border-button-border/60 bg-card-att px-2.5 py-0.5 font-semibold text-text">
                    {typeLabel}
                </span>
            )}

            {displayLabel && (
                <span className="min-w-0 max-w-full truncate rounded-full border border-card-att/90 bg-page-elevated px-2.5 py-0.5 font-medium text-text/85">
                    <span
                        aria-hidden={shouldCycleLabels || undefined}
                        className="relative block min-w-0 truncate"
                    >
                        <span
                            className={`block truncate transition-opacity duration-300 ease-out ${
                                outgoingLabel && !isCrossfading ? 'opacity-0' : 'opacity-100'
                            }`}
                        >
                            {displayLabel}
                        </span>

                        {outgoingLabel && (
                            <span
                                className={`absolute inset-0 block truncate transition-opacity duration-300 ease-out ${
                                    isCrossfading ? 'opacity-0' : 'opacity-100'
                                }`}
                            >
                                {outgoingLabel}
                            </span>
                        )}
                    </span>

                    {shouldCycleLabels && (
                        <span className="sr-only">
                            Project labels: {displayLabels.join(', ')}
                        </span>
                    )}
                </span>
            )}
        </div>
    );
}

export default ProjectClassificationPills;
