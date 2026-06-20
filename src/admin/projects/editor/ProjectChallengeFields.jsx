import { useEffect, useState } from 'react';

import CardSelector from "../../navigation/CardSelector";
import TextAreaInput from "../../forms/TextAreaInput";
import { adminUi } from '../../../styles/recipes';

const getChallengeCardId = (idx) => `challenge-${idx}`;

const parseChallengeCardId = (id) => Number(id.replace('challenge-', ''));

const clampIndex = (idx, length) => {
    if (length <= 0) return 0;
    return Math.min(Math.max(idx, 0), length - 1);
};

const getMovedIndex = (activeIndex, fromIndex, toIndex) => {
    if (activeIndex === fromIndex) return toIndex;
    if (fromIndex < toIndex && activeIndex > fromIndex && activeIndex <= toIndex) {
        return activeIndex - 1;
    }
    if (fromIndex > toIndex && activeIndex >= toIndex && activeIndex < fromIndex) {
        return activeIndex + 1;
    }
    return activeIndex;
};

function ProjectChallengeFields({ projectId, challenges, headingId, handleFieldChange }) {
    const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
    const normalizedChallenges = Array.isArray(challenges) ? challenges : [];
    const resolvedActiveIndex = clampIndex(activeChallengeIndex, normalizedChallenges.length);
    const activeChallenge = normalizedChallenges[resolvedActiveIndex];
    const challengeCards = normalizedChallenges.map((_, idx) => ({
        id: getChallengeCardId(idx),
        title: `Item ${idx + 1}`,
    }));

    useEffect(() => {
        setActiveChallengeIndex((currentIndex) => clampIndex(currentIndex, normalizedChallenges.length));
    }, [normalizedChallenges.length]);

    const addChallenge = () => {
        handleFieldChange('challenges', [
            ...normalizedChallenges,
            { challenge: '', solution: '', result: '' },
        ]);
        setActiveChallengeIndex(normalizedChallenges.length);
    };

    const updateChallenge = (idx, patch) => {
        handleFieldChange(
            'challenges',
            normalizedChallenges.map((c, i) => (i === idx ? { ...c, ...patch } : c))
        );
    };

    const removeChallenge = (idx) => {
        const nextChallenges = normalizedChallenges.filter((_, i) => i !== idx);

        handleFieldChange(
            'challenges',
            nextChallenges
        );
        setActiveChallengeIndex((currentIndex) => {
            if (currentIndex === idx) return clampIndex(idx, nextChallenges.length);
            if (currentIndex > idx) return currentIndex - 1;
            return clampIndex(currentIndex, nextChallenges.length);
        });
    };

    const reorderChallenges = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        const nextChallenges = [...normalizedChallenges];
        const [movedChallenge] = nextChallenges.splice(fromIndex, 1);
        nextChallenges.splice(toIndex, 0, movedChallenge);

        handleFieldChange('challenges', nextChallenges);
        setActiveChallengeIndex((currentIndex) => (
            getMovedIndex(currentIndex, fromIndex, toIndex)
        ));
    };

    return (
        <div className={adminUi.divider}>
            <div className="flex items-center justify-between">
                <h2 id={headingId} className={adminUi.sectionLabel}>Challenges</h2>
                <button
                    type="button"
                    onClick={addChallenge}
                    aria-label="Add challenge"
                    className={adminUi.smallSecondaryButton}
                >
                    + Add
                </button>
            </div>

            {normalizedChallenges.length === 0 ? (
                <p className={adminUi.emptyText}>No challenges added yet.</p>
            ) : (
                <div className="space-y-4">
                    <CardSelector
                        cardTypeId="Challenge"
                        cards={challengeCards}
                        activeId={getChallengeCardId(resolvedActiveIndex)}
                        onSelect={(id) => setActiveChallengeIndex(parseChallengeCardId(id))}
                        onReorder={reorderChallenges}
                    />

                    <div className="rounded-md border border-admin-border-subtle p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className={adminUi.helperText}>Item {resolvedActiveIndex + 1}</p>
                            <button
                                type="button"
                                onClick={() => removeChallenge(resolvedActiveIndex)}
                                aria-label={`Remove challenge ${resolvedActiveIndex + 1}`}
                                className={adminUi.dangerLink}
                            >
                                Remove
                            </button>
                        </div>

                        <TextAreaInput
                            id={`project-challenge-${projectId}-${resolvedActiveIndex}`}
                            label="Challenge"
                            value={activeChallenge.challenge || ''}
                            onChange={(value) => updateChallenge(resolvedActiveIndex, { challenge: value })}
                        />
                        <TextAreaInput
                            id={`project-solution-${projectId}-${resolvedActiveIndex}`}
                            label="Solution"
                            value={activeChallenge.solution || ''}
                            onChange={(value) => updateChallenge(resolvedActiveIndex, { solution: value })}
                        />
                        <TextAreaInput
                            id={`project-result-${projectId}-${resolvedActiveIndex}`}
                            label="Result"
                            value={activeChallenge.result || ''}
                            onChange={(value) => updateChallenge(resolvedActiveIndex, { result: value })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectChallengeFields;
