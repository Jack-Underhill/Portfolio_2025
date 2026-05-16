import ProjectChallengeFields   from './editor/ProjectChallengeFields';
import ProjectListFields        from './editor/ProjectListFields';
import ProjectLinkFields        from './editor/ProjectLinkFields';
import ProjectEditorHeader      from './editor/ProjectEditorHeader';
import ProjectTechStackFields   from './editor/ProjectTechStackFields';
import ProjectMediaFields       from './editor/ProjectMediaFields'
import ProjectIntroFields       from './editor/ProjectIntroFields';
import { adminUi }              from '../../styles/recipes';


function ProjectEditor({ project, onChange, onRemove }) {
  const permalink = (project.permalink || '').trim();
  const challenges = Array.isArray(project.challenges) ? project.challenges : [];

  const handleFieldChange = (field, value) => {
    onChange({ ...project, [field]: value });
  };


  return (
    <div className={adminUi.editorPanel}>
      <ProjectEditorHeader
        permalink={permalink}
        sortOrder={project.sortOrder}
        published={project.published}
        handleFieldChange={handleFieldChange}
        onRemove={onRemove}
      />

      <ProjectIntroFields
        projectId={project.id}
        title={project.title}
        description={project.description}
        overview={project.overview}
        role={project.role}
        handleFieldChange={handleFieldChange}
      />

      <ProjectMediaFields
        project={project}
        onChange={onChange}
      />

      <ProjectLinkFields
        projectId={project.id}
        live={project.url}
        source={project.sourceUrl}
        writeup={project.writeupUrl}
        video={project.videoPageUrl}
        handleFieldChange={handleFieldChange}
      />
      
      <ProjectTechStackFields
        projectId={project.id}
        stack={project.techStack}
        handleFieldChange={handleFieldChange}
      />

      <ProjectListFields 
        projectId={project.id}
        features={project.features}
        metrics={project.metrics}
        improvements={project.improvements}
        handleFieldChange={handleFieldChange}
      />

      <ProjectChallengeFields 
        projectId={project.id}
        challenges={challenges}
        handleFieldChange={handleFieldChange}
      />
    </div>
  );
}

export default ProjectEditor;
