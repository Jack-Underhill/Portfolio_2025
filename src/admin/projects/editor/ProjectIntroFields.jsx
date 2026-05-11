import TextInput from "../../forms/TextInput";
import TextAreaInput from "../../forms/TextAreaInput";


function ProjectIntroFields({ projectId, title, description, overview, role, handleFieldChange }) {
    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Intro</p>

            <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                    id={`project-title-${projectId}`}
                    label="Title"
                    value={title}
                    onChange={(value) => handleFieldChange('title', value)}
                />

                <TextAreaInput
                    id={`project-description-${projectId}`}
                    label="Card description"
                    value={description}
                    onChange={(value) => handleFieldChange('description', value)}
                />

                <TextAreaInput
                    id={`project-overview-${projectId}`}
                    label="Overview"
                    value={overview || ''}
                    onChange={(value) => handleFieldChange('overview', value)}
                />

                <TextAreaInput
                    id={`project-role-${projectId}`}
                    label="Role"
                    value={role || ''}
                    onChange={(value) => handleFieldChange('role', value)}
                />
            </div>
        </div>
    );
};

export default ProjectIntroFields;
