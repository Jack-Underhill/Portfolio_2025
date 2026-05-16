import TextAreaInput from "../../forms/TextAreaInput";
import { adminUi } from '../../../styles/recipes';


function ProjectChallengeFields({ projectId, challenges, handleFieldChange }) {
    const addChallenge = () => {
        handleFieldChange('challenges', [
            ...challenges,
            { challenge: '', solution: '', result: '' },
        ]);
    };

    const updateChallenge = (idx, patch) => {
        handleFieldChange(
            'challenges',
            challenges.map((c, i) => (i === idx ? { ...c, ...patch } : c))
        );
    };

    const removeChallenge = (idx) => {
        handleFieldChange(
            'challenges',
            challenges.filter((_, i) => i !== idx)
        );
    };


    return (
        <div className={adminUi.divider}>
            <div className="flex items-center justify-between">
                <p className={adminUi.sectionLabel}>Challenges</p>
                <button
                    type="button"
                    onClick={addChallenge}
                    className={adminUi.smallSecondaryButton}
                >
                    + Add
                </button>
            </div>

            {challenges.length === 0 ? (
                <p className={adminUi.emptyText}>No challenges added yet.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {challenges.map((c, idx) => (
                        <div key={idx} className="rounded-md border border-admin-border-subtle p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className={adminUi.helperText}>Item {idx + 1}</p>
                                <button
                                    type="button"
                                    onClick={() => removeChallenge(idx)}
                                    className={adminUi.dangerLink}
                                >
                                    Remove
                                </button>
                            </div>

                            <TextAreaInput
                                id={`project-challenge-${projectId}-${idx}`}
                                label="Challenge"
                                value={c.challenge || ''}
                                onChange={(value) => updateChallenge(idx, { challenge: value })}
                            />
                            <TextAreaInput
                                id={`project-solution-${projectId}-${idx}`}
                                label="Solution"
                                value={c.solution || ''}
                                onChange={(value) => updateChallenge(idx, { solution: value })}
                            />
                            <TextAreaInput
                                id={`project-result-${projectId}-${idx}`}
                                label="Result"
                                value={c.result || ''}
                                onChange={(value) => updateChallenge(idx, { result: value })}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectChallengeFields;
