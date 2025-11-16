import InputLabel from './InputLabel';

function InputTextArea({ id, label, value, onChange, minRows = 4, ...props }) {
    return (
        <div className="space-y-1">
            {label && (
                <InputLabel htmlFor={id}>
                    {label}
                </InputLabel>
            )}
            <textarea
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={minRows}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500 min-h-[80px]"
                {...props}
            />
        </div>
    );
}

export default InputTextArea;
