import FieldLabel from './FieldLabel';
import { adminForm } from '../../styles/recipes';

function FileInput({ id, label, onChange, accept }) {
    return (
        <div className="space-y-1">
            {label &&
                <FieldLabel htmlFor={id}>
                    {label}
                </FieldLabel>
            }
            
            <div
                className={adminForm.fileShell}
            >
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={e => onChange(e.target.files?.[0] ?? null)}
                    className={adminForm.fileInput}
                />
            </div>
        </div>
    );
}

export default FileInput;
