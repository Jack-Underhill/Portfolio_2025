import FieldLabel from './FieldLabel';
import { adminForm } from '../../styles/recipes';
import useAutoTextarea from '../../hooks/useAutoTextarea';


function TextAreaInput({ id, label, value, onChange, minRows = 1, ...props }) {
    const ref = useAutoTextarea({ value, minRows });

    const trimTrailingWhitespace = (s = '') => s.replace(/[ \t\r\n]+$/g, '');
    const handleBlur = (event) => {
        const trimmedValue = trimTrailingWhitespace(event.target.value);
        if (trimmedValue !== event.target.value) {
            onChange(trimmedValue);
        }
    };

    return (
        <div className="space-y-1">
            {label && (
                <FieldLabel htmlFor={id}>
                    {label}
                </FieldLabel>
            )}

            <textarea
                ref={ref}
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                onBlur={handleBlur}
                rows={minRows}
                className={adminForm.textarea}
                {...props}
            />
        </div>
    );
}

export default TextAreaInput;
