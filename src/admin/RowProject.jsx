import InputText from './InputText';
import InputTextArea from './InputTextArea';
import InputFile from './InputFile';
import ViewImage from './ViewImage';
import ListTech from './ListTech';

function RowProject({ project, onChange, onRemove }) {
  const permalink = (project.permalink || '').trim();

  const handleFieldChange = (field, value) => {
    onChange({ ...project, [field]: value });
  };

  const handleImageFileChange = (file) => {
    onChange({ ...project, imageFile: file });
  };

  const handleArchitectureImageFileChange = (file) => {
    onChange({ ...project, architectureImageFile: file });
  };

  const handleVideoFileChange = (file) => {
    onChange({ ...project, videoFile: file });
  };

  const setTechStackCategory = (category, nextValues) => {
    const nextStack = { ...(project.techStack || {}) };
    nextStack[category] = nextValues;
    handleFieldChange('techStack', nextStack);
  };

  const challenges = Array.isArray(project.challenges) ? project.challenges : [];
  const addChallenge = () => {
    handleFieldChange('challenges', [
      ...challenges,
      { challenge: '', solution: '', result: '' },
    ]);
  };

  const removeChallenge = (idx) => {
    handleFieldChange(
      'challenges',
      challenges.filter((_, i) => i !== idx)
    );
  };

  const updateChallenge = (idx, patch) => {
    handleFieldChange(
      'challenges',
      challenges.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  };

  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">
            {project.title || 'New Project'}
          </h3>
          <p className="text-xs text-slate-400">
            sortOrder: {Number.isFinite(project.sortOrder) ? project.sortOrder : 0}
          </p>
          {permalink ? (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              <span className="text-slate-500">Permalink:</span>
              <code className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800">
                {permalink}
              </code>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500 italic">
              Permalink: (save to generate)
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={project.published !== false}
              onChange={(e) => handleFieldChange('published', e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
            />
            Published
          </label>

          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* LEFT: media */}
        <div className="space-y-3">
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
          

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Tech (categorized)</p>

            <ListTech
              idPrefix={`project-tech-frontend-${project.id}`}
              label="Frontend"
              values={project.techStack?.frontend || ['']}
              onChange={(next) => setTechStackCategory('frontend', next)}
            />

            <ListTech
              idPrefix={`project-tech-backend-${project.id}`}
              label="Backend"
              values={project.techStack?.backend || ['']}
              onChange={(next) => setTechStackCategory('backend', next)}
            />

            <ListTech
              idPrefix={`project-tech-data-${project.id}`}
              label="Data"
              values={project.techStack?.data || ['']}
              onChange={(next) => setTechStackCategory('data', next)}
            />

            <ListTech
              idPrefix={`project-tech-infra-${project.id}`}
              label="Infrastructure"
              values={project.techStack?.infrastructure || ['']}
              onChange={(next) => setTechStackCategory('infrastructure', next)}
            />
          </div>
        </div>

        {/* RIGHT: text + lists */}
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Card</p>

            <InputText
              id={`project-title-${project.id}`}
              label="Title"
              value={project.title}
              onChange={(value) => handleFieldChange('title', value)}
            />

            <InputTextArea
              id={`project-description-${project.id}`}
              label="Card description"
              value={project.description}
              onChange={(value) => handleFieldChange('description', value)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal</p>

            <InputTextArea
              id={`project-overview-${project.id}`}
              label="Overview"
              value={project.overview || ''}
              onChange={(value) => handleFieldChange('overview', value)}
            />

            <InputText
              id={`project-role-${project.id}`}
              label="Role"
              value={project.role || ''}
              onChange={(value) => handleFieldChange('role', value)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal Links</p>

            <InputText
              id={`project-url-${project.id}`}
              label="Live URL"
              value={project.url || ''}
              onChange={(value) => handleFieldChange('url', value)}
            />

            <InputText
              id={`project-source-${project.id}`}
              label="Source Code URL"
              value={project.sourceUrl || ''}
              onChange={(value) => handleFieldChange('sourceUrl', value)}
            />

            <InputText
              id={`project-writeup-${project.id}`}
              label="Writeup URL"
              value={project.writeupUrl || ''}
              onChange={(value) => handleFieldChange('writeupUrl', value)}
            />

            <InputText
              id={`project-video-page-${project.id}`}
              label="Video page URL (YouTube, etc.)"
              value={project.videoPageUrl || ''}
              onChange={(value) => handleFieldChange('videoPageUrl', value)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal Lists</p>

            <ListTech
              idPrefix={`project-features-${project.id}`}
              label="Key features"
              values={project.features || ['']}
              onChange={(next) => handleFieldChange('features', next)}
            />

            <ListTech
              idPrefix={`project-metrics-${project.id}`}
              label="Metrics"
              values={project.metrics || ['']}
              onChange={(next) => handleFieldChange('metrics', next)}
            />

            <ListTech
              idPrefix={`project-improvements-${project.id}`}
              label="Improvements"
              values={project.improvements || ['']}
              onChange={(next) => handleFieldChange('improvements', next)}
            />
          </div>
        </div>
      </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">Challenges</p>
              <button
                type="button"
                onClick={addChallenge}
                className="rounded-md bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700"
              >
                + Add
              </button>
            </div>

            {challenges.length === 0 ? (
              <p className="text-xs text-slate-500">No challenges added yet.</p>
            ) : (
              <div className="space-y-3">
                {challenges.map((c, idx) => (
                  <div key={idx} className="rounded-md border border-slate-800 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">Item {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeChallenge(idx)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <InputTextArea
                      id={`project-challenge-${project.id}-${idx}`}
                      label="Challenge"
                      value={c.challenge || ''}
                      onChange={(value) => updateChallenge(idx, { challenge: value })}
                    />
                    <InputTextArea
                      id={`project-solution-${project.id}-${idx}`}
                      label="Solution"
                      value={c.solution || ''}
                      onChange={(value) => updateChallenge(idx, { solution: value })}
                    />
                    <InputTextArea
                      id={`project-result-${project.id}-${idx}`}
                      label="Result"
                      value={c.result || ''}
                      onChange={(value) => updateChallenge(idx, { result: value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}

export default RowProject;
