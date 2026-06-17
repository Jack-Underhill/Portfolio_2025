import TextAreaInput from '../forms/TextAreaInput';
import { adminUi } from '../../styles/recipes';

function ProjectBioEditor({ value, onChange }) {
    return (
        <div id="admin-project-intro">
            <TextAreaInput
                id="about-project-bio"
                label="Projects intro / bio"
                value={value ?? ''}
                onChange={onChange}
            />
        </div>
    );
}

export default ProjectBioEditor;
