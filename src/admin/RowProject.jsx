import Challenges   from './project/Challenges';
import BulletLists  from './project/BulletLists';
import Links        from './project/Links';
import Header       from './project/Header';
import TechStack    from './project/TechStack';
import Media        from './project/Media'
import TitleDesc    from './project/TitleDesc';
import OverviewRole from './project/OverviewRole';


function RowProject({ project, onChange, onRemove }) {
  const permalink = (project.permalink || '').trim();
  const challenges = Array.isArray(project.challenges) ? project.challenges : [];

  const handleFieldChange = (field, value) => {
    onChange({ ...project, [field]: value });
  };


  return (
    <div className="border border-slate-700 rounded-lg p-4 space-y-4">
      <Header
        title={project.title}
        permalink={permalink}
        sortOrder={project.sortOrder}
        published={project.published}
        handleFieldChange={handleFieldChange}
        onRemove={onRemove}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-3">
          <Media
            project={project}
            onChange={onChange}
          />

          <TechStack
            projectId={project.id}
            stack={project.techStack}
            handleFieldChange={handleFieldChange}
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <TitleDesc
            projectId={project.id}
            title={project.title}
            description={project.description}
            handleFieldChange={handleFieldChange}
          />

          <OverviewRole
            projectId={project.id}
            overview={project.overview}
            role={project.role}
            handleFieldChange={handleFieldChange}
          />

          <Links
            projectId={project.id}
            live={project.url}
            source={project.sourceUrl}
            writeup={project.writeupUrl}
            video={project.videoPageUrl}
            handleFieldChange={handleFieldChange}
          />

          <BulletLists 
            projectId={project.id}
            features={project.features}
            metrics={project.metrics}
            improvements={project.improvements}
            handleFieldChange={handleFieldChange}
          />
        </div>
      </div>

      <Challenges 
        projectId={project.id}
        challenges={challenges}
        handleFieldChange={handleFieldChange}
      />
    </div>
  );
}

export default RowProject;
