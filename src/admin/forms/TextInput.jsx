import FieldLabel from './FieldLabel';
import { adminForm } from '../../styles/recipes';

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
                className={adminForm.input}
                {...props}
            />
        </div>
    );
}

export default TextInput;
