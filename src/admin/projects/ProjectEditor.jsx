import ProjectAgentSection     from './ProjectAgentSection';
import ProjectChallengeFields   from './editor/ProjectChallengeFields';
import ProjectClassificationFields from './editor/ProjectClassificationFields';
import ProjectListFields        from './editor/ProjectListFields';
import ProjectLinkFields        from './editor/ProjectLinkFields';
import ProjectTechStackFields   from './editor/ProjectTechStackFields';
import ProjectMediaFields       from './editor/ProjectMediaFields'
import ProjectIntroFields       from './editor/ProjectIntroFields';
import { getProjectEditorSectionElementId } from './projectEditorSections';
import { adminUi }              from '../../styles/recipes';

function ProjectEditor({ project, agentDraft, onSectionChange, onRemove, onSectionMount }) {
  const permalink = (project.permalink || '').trim();
  const challenges = Array.isArray(project.challenges) ? project.challenges : [];

  const createSectionFieldChangeHandler = (sectionId) => (field, value) => {
    onSectionChange(sectionId, { ...project, [field]: value });
  };

  const getSectionRef = (sectionId) => (element) => {
    onSectionMount?.(sectionId, element);
  };

  const getSectionHeadingId = (sectionId) => `${getProjectEditorSectionElementId(sectionId)}-title`;

  return (
    <div className={adminUi.editorPanel}>
      <div className="space-y-6">
        <section
          id={getProjectEditorSectionElementId('classification')}
          ref={getSectionRef('classification')}
          aria-labelledby={getSectionHeadingId('classification')}
          className={adminUi.projectEditorSection}
        >
          <ProjectClassificationFields
            projectId={project.id}
            permalink={permalink}
            sortOrder={project.sortOrder}
            published={project.published}
            title={project.title}
            featuredRank={project.featuredRank}
            projectType={project.projectType}
            labels={project.labels}
            headingId={getSectionHeadingId('classification')}
            handleFieldChange={createSectionFieldChangeHandler('classification')}
            onRemove={onRemove}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('intro')}
          ref={getSectionRef('intro')}
          aria-labelledby={getSectionHeadingId('intro')}
          className={adminUi.projectEditorSection}
        >
          <ProjectIntroFields
            projectId={project.id}
            title={project.title}
            description={project.description}
            overview={project.overview}
            role={project.role}
            headingId={getSectionHeadingId('intro')}
            handleFieldChange={createSectionFieldChangeHandler('intro')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('media')}
          ref={getSectionRef('media')}
          aria-labelledby={getSectionHeadingId('media')}
          className={adminUi.projectEditorSection}
        >
          <ProjectMediaFields
            project={project}
            headingId={getSectionHeadingId('media')}
            handleFieldChange={createSectionFieldChangeHandler('media')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('links')}
          ref={getSectionRef('links')}
          aria-labelledby={getSectionHeadingId('links')}
          className={adminUi.projectEditorSection}
        >
          <ProjectLinkFields
            projectId={project.id}
            live={project.url}
            source={project.sourceUrl}
            writeup={project.writeupUrl}
            video={project.videoPageUrl}
            headingId={getSectionHeadingId('links')}
            handleFieldChange={createSectionFieldChangeHandler('links')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('tech')}
          ref={getSectionRef('tech')}
          aria-labelledby={getSectionHeadingId('tech')}
          className={adminUi.projectEditorSection}
        >
          <ProjectTechStackFields
            projectId={project.id}
            stack={project.techStack}
            headingId={getSectionHeadingId('tech')}
            handleFieldChange={createSectionFieldChangeHandler('tech')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('lists')}
          ref={getSectionRef('lists')}
          aria-labelledby={getSectionHeadingId('lists')}
          className={adminUi.projectEditorSection}
        >
          <ProjectListFields
            projectId={project.id}
            features={project.features}
            metrics={project.metrics}
            improvements={project.improvements}
            headingId={getSectionHeadingId('lists')}
            handleFieldChange={createSectionFieldChangeHandler('lists')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('challenges')}
          ref={getSectionRef('challenges')}
          aria-labelledby={getSectionHeadingId('challenges')}
          className={adminUi.projectEditorSection}
        >
          <ProjectChallengeFields
            projectId={project.id}
            challenges={challenges}
            headingId={getSectionHeadingId('challenges')}
            handleFieldChange={createSectionFieldChangeHandler('challenges')}
          />
        </section>

        <section
          id={getProjectEditorSectionElementId('agent')}
          ref={getSectionRef('agent')}
          aria-labelledby={getSectionHeadingId('agent')}
          className={adminUi.projectEditorSection}
        >
          <ProjectAgentSection
            hasActiveProject={Boolean(project)}
            agentRun={agentDraft.agentRun}
            contextPanelId={agentDraft.contextPanelId}
            contextText={agentDraft.contextText}
            headingId={getSectionHeadingId('agent')}
            importPanelId={agentDraft.importPanelId}
            isContextOpen={agentDraft.isContextOpen}
            isImportOpen={agentDraft.isImportOpen}
            isSaveInFlight={agentDraft.isSaveInFlight}
            canClearResult={agentDraft.canClearResult}
            canRetry={agentDraft.canRetry}
            onApplyDraft={agentDraft.onApplyDraft}
            onApplySuccess={agentDraft.onApplySuccess}
            onClearResult={agentDraft.onClearResult}
            onCopySuccess={agentDraft.onCopySuccess}
            onRunAgent={agentDraft.onRunAgent}
            onRetryAgent={agentDraft.onRetryAgent}
            onToggleContext={agentDraft.onToggleContext}
            onToggleImport={agentDraft.onToggleImport}
          />
        </section>
      </div>
    </div>
  );
}

export default ProjectEditor;
