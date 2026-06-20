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

function ProjectEditor({ project, onChange, onRemove, onSectionMount }) {
  const permalink = (project.permalink || '').trim();
  const challenges = Array.isArray(project.challenges) ? project.challenges : [];

  const handleFieldChange = (field, value) => {
    onChange({ ...project, [field]: value });
  };

  const getSectionRef = (sectionId) => (element) => {
    onSectionMount?.(sectionId, element);
  };

  const getSectionHeadingId = (sectionId) => `${getProjectEditorSectionElementId(sectionId)}-title`;

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
          ref={getSectionRef('classification')}
          aria-labelledby={getSectionHeadingId('classification')}
          className="scroll-mt-8"
        >
          <ProjectClassificationFields
            projectId={project.id}
            featuredRank={project.featuredRank}
            projectType={project.projectType}
            labels={project.labels}
            headingId={getSectionHeadingId('classification')}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('intro')}
          ref={getSectionRef('intro')}
          aria-labelledby={getSectionHeadingId('intro')}
          className="scroll-mt-8"
        >
          <ProjectIntroFields
            projectId={project.id}
            title={project.title}
            description={project.description}
            overview={project.overview}
            role={project.role}
            headingId={getSectionHeadingId('intro')}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('media')}
          ref={getSectionRef('media')}
          aria-labelledby={getSectionHeadingId('media')}
          className="scroll-mt-8"
        >
          <ProjectMediaFields
            project={project}
            headingId={getSectionHeadingId('media')}
            onChange={onChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('links')}
          ref={getSectionRef('links')}
          aria-labelledby={getSectionHeadingId('links')}
          className="scroll-mt-8"
        >
          <ProjectLinkFields
            projectId={project.id}
            live={project.url}
            source={project.sourceUrl}
            writeup={project.writeupUrl}
            video={project.videoPageUrl}
            headingId={getSectionHeadingId('links')}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('tech')}
          ref={getSectionRef('tech')}
          aria-labelledby={getSectionHeadingId('tech')}
          className="scroll-mt-8"
        >
          <ProjectTechStackFields
            projectId={project.id}
            stack={project.techStack}
            headingId={getSectionHeadingId('tech')}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('lists')}
          ref={getSectionRef('lists')}
          aria-labelledby={getSectionHeadingId('lists')}
          className="scroll-mt-8"
        >
          <ProjectListFields
            projectId={project.id}
            features={project.features}
            metrics={project.metrics}
            improvements={project.improvements}
            headingId={getSectionHeadingId('lists')}
            handleFieldChange={handleFieldChange}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('challenges')}
          ref={getSectionRef('challenges')}
          aria-labelledby={getSectionHeadingId('challenges')}
          className="scroll-mt-8"
        >
          <ProjectChallengeFields
            projectId={project.id}
            challenges={challenges}
            headingId={getSectionHeadingId('challenges')}
            handleFieldChange={handleFieldChange}
          />
        </section>
      </div>
    </div>
  );
}

export default ProjectEditor;
