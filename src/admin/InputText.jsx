import InputLabel from './InputLabel';

function InputText({ id, label, value, onChange, ...props }) {
    return (
        <div className="space-y-1">
            {label && 
                <InputLabel htmlFor={id}>
                    {label}
                </InputLabel>
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

export default InputText;
