import TextInput from "../../forms/TextInput";


function ProjectLinkFields({ projectId, live, source, writeup, video, handleFieldChange }) {
    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Links</p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TextInput
                    id={`project-url-${projectId}`}
                    label="Live URL"
                    value={live || ''}
                    onChange={(value) => handleFieldChange('url', value)}
                />

                <TextInput
                    id={`project-source-${projectId}`}
                    label="Source Code URL"
                    value={source || ''}
                    onChange={(value) => handleFieldChange('sourceUrl', value)}
                />

                <TextInput
                    id={`project-writeup-${projectId}`}
                    label="Writeup URL"
                    value={writeup || ''}
                    onChange={(value) => handleFieldChange('writeupUrl', value)}
                />

                <TextInput
                    id={`project-video-page-${projectId}`}
                    label="Video page URL (YouTube, etc.)"
                    value={video || ''}
                    onChange={(value) => handleFieldChange('videoPageUrl', value)}
                />
            </div>
        </div>
    );
};

export default ProjectLinkFields;
