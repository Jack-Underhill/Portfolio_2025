import InputText from './InputText';

function RowTech({
    id,
    value,
    isDragging,
    isDragOver,
    onChange,
    onRemove,
    dragProps,
}) {
    return (
        <div
            {...dragProps}
            className={[
                'flex gap-2 items-center rounded-md border border-slate-700 px-2 py-1',
                isDragOver ? 'bg-slate-800/70' : 'bg-slate-900',
                isDragging ? 'opacity-70' : '',
            ].join(' ')}
        >
            <span className="cursor-grab select-none text-xs text-slate-400">
                ☰
            </span>

            <div className="flex-1">
                <InputText
                    id={id}
                    label={null}
                    value={value}
                    onChange={onChange}
                />
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="text-xs px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800"
            >
                ✕
            </button>
        </div>
    );
}

export default RowTech;
