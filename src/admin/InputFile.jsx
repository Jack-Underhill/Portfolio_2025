import InputLabel from './InputLabel';

function InputFile({ id, label, onChange, accept }) {
    return (
        <div className="space-y-1">
            {label &&
                <InputLabel htmlFor={id}>
                    {label}
                </InputLabel>
            }
            
            <div
                className="
                rounded-md border border-slate-700 bg-slate-900 px-3 py-2
                transition-colors cursor-pointer
                hover:border-sky-500 hover:bg-slate-800
                "
            >
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={e => onChange(e.target.files?.[0] ?? null)}
                    className="
                        block w-full text-xs text-slate-200
                        file:mr-2 file:rounded-md file:border-0
                        file:bg-slate-800 file:px-2 file:py-1
                        file:text-xs file:text-slate-100
                        cursor-pointer
                    "
                />
            </div>
        </div>
    );
}

export default InputFile;
