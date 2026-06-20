import FieldLabel from './FieldLabel';
import { adminForm, adminUi } from '../../styles/recipes';

function FileInput({
    id,
    label,
    onChange,
    accept,
    selectedFile = null,
    hasCurrentFile = false,
    currentLabel = 'Current file saved',
    emptyLabel = 'No file selected',
}) {
    const statusId = `${id}-status`;
    const actionText = hasCurrentFile ? 'Replace file' : 'Choose file';
    const statusText = selectedFile
        ? `Selected: ${selectedFile.name}, ${hasCurrentFile ? 'will replace current file on save' : 'not saved yet'}`
        : hasCurrentFile
            ? currentLabel
            : emptyLabel;

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
                <span
                    aria-hidden="true"
                    className={adminForm.fileAction}
                >
                    {actionText}
                </span>

                <input
                    id={id}
                    type="file"
                    accept={accept}
                    aria-describedby={statusId}
                    onChange={e => onChange(e.target.files?.[0] ?? null)}
                    className={adminForm.fileInput}
                />
            </div>

            <p
                id={statusId}
                className={adminUi.helperText}
            >
                {statusText}
            </p>
        </div>
    );
}

export default FileInput;
