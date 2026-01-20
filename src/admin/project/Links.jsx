import InputText from "../InputText";


function Links({ projectId, live, source, writeup, video, handleFieldChange }) {
    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal Links</p>

            <InputText
                id={`project-url-${projectId}`}
                label="Live URL"
                value={live || ''}
                onChange={(value) => handleFieldChange('url', value)}
            />

            <InputText
                id={`project-source-${projectId}`}
                label="Source Code URL"
                value={source || ''}
                onChange={(value) => handleFieldChange('sourceUrl', value)}
            />

            <InputText
                id={`project-writeup-${projectId}`}
                label="Writeup URL"
                value={writeup || ''}
                onChange={(value) => handleFieldChange('writeupUrl', value)}
            />

            <InputText
                id={`project-video-page-${projectId}`}
                label="Video page URL (YouTube, etc.)"
                value={video || ''}
                onChange={(value) => handleFieldChange('videoPageUrl', value)}
            />
        </div>
    );
};

export default Links;