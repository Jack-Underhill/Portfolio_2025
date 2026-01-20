import InputText from "../InputText";
import InputTextArea from "../InputTextArea";


function TitleDesc({ projectId, title, description, handleFieldChange }) {
    return (
        <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Card</p>

            <InputText
                id={`project-title-${projectId}`}
                label="Title"
                value={title}
                onChange={(value) => handleFieldChange('title', value)}
            />

            <InputTextArea
                id={`project-description-${projectId}`}
                label="Card description"
                value={description}
                onChange={(value) => handleFieldChange('description', value)}
            />
        </div>
    );
};

export default TitleDesc;