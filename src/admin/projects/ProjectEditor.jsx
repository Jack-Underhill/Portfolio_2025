import ProjectChallengeFields   from './editor/ProjectChallengeFields';
import ProjectClassificationFields from './editor/ProjectClassificationFields';
import ProjectListFields        from './editor/ProjectListFields';
import ProjectLinkFields        from './editor/ProjectLinkFields';
import ProjectEditorHeader      from './editor/ProjectEditorHeader';
import ProjectTechStackFields   from './editor/ProjectTechStackFields';
import ProjectMediaFields       from './editor/ProjectMediaFields'
import ProjectIntroFields       from './editor/ProjectIntroFields';
import { getProjectEditorSectionElementId } from './projectEditorSections';
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
        title={project.title}
        handleFieldChange={handleFieldChange}
        onRemove={onRemove}
      />

      <div className="space-y-6">
        <section
          id={getProjectEditorSectionElementId('classification')}
          aria-label="Classification project fields"
          className="scroll-mt-8"
        >
          <ProjectClassificationFields
            projectId={project.id}
            featuredRank={project.featuredRank}
            projectType={project.projectType}
            labels={project.labels}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('intro')}
          aria-label="Intro project fields"
          className="scroll-mt-8"
        >
          <ProjectIntroFields
            projectId={project.id}
            title={project.title}
            description={project.description}
            overview={project.overview}
            role={project.role}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('media')}
          aria-label="Media project fields"
          className="scroll-mt-8"
        >
          <ProjectMediaFields
            project={project}
            onChange={onChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('links')}
          aria-label="Links project fields"
          className="scroll-mt-8"
        >
          <ProjectLinkFields
            projectId={project.id}
            live={project.url}
            source={project.sourceUrl}
            writeup={project.writeupUrl}
            video={project.videoPageUrl}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('tech')}
          aria-label="Tech project fields"
          className="scroll-mt-8"
        >
          <ProjectTechStackFields
            projectId={project.id}
            stack={project.techStack}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('lists')}
          aria-label="Lists project fields"
          className="scroll-mt-8"
        >
          <ProjectListFields
            projectId={project.id}
            features={project.features}
            metrics={project.metrics}
            improvements={project.improvements}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('challenges')}
          aria-label="Challenges project fields"
          className="scroll-mt-8"
        >
          <ProjectChallengeFields
            projectId={project.id}
            challenges={challenges}
            handleFieldChange={handleFieldChange}
          />
        </section>
      </div>
    </div>
  );
}

export default ProjectEditor;
