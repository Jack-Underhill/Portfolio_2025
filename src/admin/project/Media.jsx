import InputFile from '../InputFile';
import ViewImage from '../ViewImage';


function Media({ project, onChange }) {
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
        <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Media</p>

            {/* Project image */}
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

            {/* Architecture image */}
            <InputFile
                id={`project-arch-${project.id}`}
                label="Architecture image"
                accept="image/*"
                onChange={handleArchitectureImageFileChange}
            />
            <ViewImage
                file={project.architectureImageFile || null}
                url={project.architectureImageUrl || ''}
                alt={project.title || 'Architecture image'}
            />

            {/* Preview video */}
            <div className="space-y-1">
                <InputFile
                    id={`project-video-${project.id}`}
                    label="Preview video (mp4)"
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
    );
};

export default Media;