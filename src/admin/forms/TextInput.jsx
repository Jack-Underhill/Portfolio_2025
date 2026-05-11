import FieldLabel from './FieldLabel';

function TextInput({ id, label, value, onChange, ...props }) {
    return (
        <div className="space-y-1">
            {label && 
                <FieldLabel htmlFor={id}>
                    {label}
                </FieldLabel>
            }
            <input
                id={id}
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                {...props}
            />
        </div>
    );
}

export default TextInput;
