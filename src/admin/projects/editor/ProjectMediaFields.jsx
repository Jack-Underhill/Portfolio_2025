import FileInput from '../../forms/FileInput';
import ImagePreview from '../../media/ImagePreview';
import { adminUi } from '../../../styles/recipes';


function ProjectMediaFields({ project, onChange }) {
    const handleImageFileChange = (file) => {
        onChange({ ...project, imageFile: file });
    };

    const handleArchitectureImageFileChange = (file) => {
        onChange({ ...project, architectureImageFile: file });
    };

    const handleVideoFileChange = (file) => {
        onChange({ ...project, videoFile: file });
    };

    return (
        <div className={adminUi.divider}>
            <p className={adminUi.sectionLabel}>Media</p>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {/* Project image */}
                <div className="space-y-2">
                    <FileInput
                        id={`project-image-${project.id}`}
                        label="Project image"
                        accept="image/*"
                        onChange={handleImageFileChange}
                    />
                    <ImagePreview
                        file={project.imageFile || null}
                        url={project.imageUrl || ''}
                        alt={`${project.title || 'Project'} image preview`}
                    />
                </div>

                {/* Architecture image */}
                <div className="space-y-2">
                    <FileInput
                        id={`project-arch-${project.id}`}
                        label="Architecture image"
                        accept="image/*"
                        onChange={handleArchitectureImageFileChange}
                    />
                    <ImagePreview
                        file={project.architectureImageFile || null}
                        url={project.architectureImageUrl || ''}
                        alt={`${project.title || 'Project'} architecture image preview`}
                    />
                </div>

                {/* Preview video */}
                <div className="space-y-1">
                    <FileInput
                        id={`project-video-${project.id}`}
                        label="Preview video (mp4)"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                    />

                    {project.videoUrl && (
                        <p className={adminUi.helperText}>
                            Current video:{' '}
                            <a
                                href={project.videoUrl || project.videoFile}
                                target="_blank"
                                rel="noreferrer"
                                className={adminUi.inlineLink}
                            >
                                Open in new tab
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectMediaFields;
