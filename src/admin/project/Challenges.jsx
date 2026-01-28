import InputTextArea from "../InputTextArea";


function Challenges({ projectId, challenges, handleFieldChange }) {
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
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">Challenges</p>
                <button
                    type="button"
                    onClick={addChallenge}
                    className="rounded-md bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700"
                >
                    + Add
                </button>
            </div>

            {challenges.length === 0 ? (
                <p className="text-xs text-slate-500">No challenges added yet.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {challenges.map((c, idx) => (
                        <div key={idx} className="rounded-md border border-slate-800 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400">Item {idx + 1}</p>
                                <button
                                    type="button"
                                    onClick={() => removeChallenge(idx)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Remove
                                </button>
                            </div>

                            <InputTextArea
                                id={`project-challenge-${projectId}-${idx}`}
                                label="Challenge"
                                value={c.challenge || ''}
                                onChange={(value) => updateChallenge(idx, { challenge: value })}
                            />
                            <InputTextArea
                                id={`project-solution-${projectId}-${idx}`}
                                label="Solution"
                                value={c.solution || ''}
                                onChange={(value) => updateChallenge(idx, { solution: value })}
                            />
                            <InputTextArea
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

export default Challenges;