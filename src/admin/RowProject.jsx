import InputText from './InputText';
import InputTextArea from './InputTextArea';
import InputFile from './InputFile';
import ViewImage from './ViewImage';
import ListTech from './ListTech';

function RowProject({ project, onChange, onRemove }) {
    const handleFieldChange = (field, value) => {
        onChange({ ...project, [field]: value });
    };

    const handleImageFileChange = (file) => {
        onChange({ ...project, imageFile: file });
    };

    const handleVideoFileChange = (file) => {
        onChange({ ...project, videoFile: file });
    };

    return (
        <div className="border border-slate-700 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">
                    {project.title || 'New Project'}
                </h3>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-xs text-red-400 hover:text-red-300"
                >
                    Remove
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    {/* Image controls */}
                    <InputFile
                        id={`project-image-${project.id}`}
                        label="Project image"
                        accept="image/*"
                        onChange={handleImageFileChange}
                    />
                    <ViewImage
                        file={project.imageFile || null}
                        url={project.imageUrl || ''}
                        alt={project.title || 'Project image'}
                    />

                    {/* Video controls */}
                    <div className="space-y-1">
                        <InputFile
                            id={`project-video-${project.id}`}
                            label="Preview video"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                        />

                        {project.videoUrl && (
                            <p className="text-xs text-slate-400">
                                Current video:{' '}
                                <a
                                    href={project.videoUrl || project.videoFile}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 text-sky-400"
                                >
                                    Open in new tab
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                {/* Text + techs column */}
                <div className="space-y-3">
                    <InputText
                        id={`project-title-${project.id}`}
                        label="Title"
                        value={project.title}
                        onChange={(value) => handleFieldChange('title', value)}
                    />

                    <InputTextArea
                        id={`project-description-${project.id}`}
                        label="Description"
                        value={project.description}
                        onChange={(value) => handleFieldChange('description', value)}
                    />

                    <InputText
                        id={`project-url-${project.id}`}
                        label="Project URL"
                        value={project.url || ''}
                        onChange={(value) => handleFieldChange('url', value)}
                    />

                    <ListTech
                        idPrefix={`project-tech-${project.id}`}
                        label="Tech stack"
                        values={project.techs || []}
                        onChange={(next) => handleFieldChange('techs', next)}
                    />
                </div>
            </div>
        </div>
    );
}

export default RowProject;
