


function Header({ title, permalink, sortOrder, published, handleFieldChange, onRemove }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <div className="min-w-0">
                <p className="text-xs text-slate-400">
                    sortOrder: {Number.isFinite(sortOrder) ? sortOrder : 0}
                </p>

                {permalink ? (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span className="text-slate-500">Permalink:</span>
                        <code className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {permalink}
                        </code>
                    </div>
                ) : (
                    <p className="mt-1 text-xs text-slate-500 italic">
                        Permalink: (save to generate)
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 select-none">
                    <input
                        type="checkbox"
                        checked={published !== false}
                        onChange={(e) => handleFieldChange('published', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    Published
                </label>

                <button
                    type="button"
                    onClick={onRemove}
                    className="text-xs text-red-400 hover:text-red-300"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default Header;