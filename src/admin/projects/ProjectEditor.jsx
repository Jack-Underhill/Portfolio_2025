import { useState }              from 'react';

import ProjectChallengeFields   from './editor/ProjectChallengeFields';
import ProjectClassificationFields from './editor/ProjectClassificationFields';
import ProjectListFields        from './editor/ProjectListFields';
import ProjectLinkFields        from './editor/ProjectLinkFields';
import ProjectEditorHeader      from './editor/ProjectEditorHeader';
import ProjectTechStackFields   from './editor/ProjectTechStackFields';
import ProjectMediaFields       from './editor/ProjectMediaFields'
import ProjectIntroFields       from './editor/ProjectIntroFields';
import CardSelector             from '../navigation/CardSelector';
import { adminUi }              from '../../styles/recipes';

const PROJECT_EDITOR_SECTIONS = [
  { id: 'classification', title: 'Classification' },
  { id: 'intro', title: 'Intro' },
  { id: 'media', title: 'Media' },
  { id: 'links', title: 'Links' },
  { id: 'tech', title: 'Tech' },
  { id: 'lists', title: 'Lists' },
  { id: 'challenges', title: 'Challenges' },
];

function ProjectEditor({ project, onChange, onRemove }) {
  const [activeSectionId, setActiveSectionId] = useState(PROJECT_EDITOR_SECTIONS[0].id);
  const permalink = (project.permalink || '').trim();
  const challenges = Array.isArray(project.challenges) ? project.challenges : [];

  const handleFieldChange = (field, value) => {
    onChange({ ...project, [field]: value });
  };

  const renderActiveSection = () => {
    switch (activeSectionId) {
      case 'classification':
        return (
          <ProjectClassificationFields
            projectId={project.id}
            featuredRank={project.featuredRank}
            projectType={project.projectType}
            labels={project.labels}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'intro':
        return (
          <ProjectIntroFields
            projectId={project.id}
            title={project.title}
            description={project.description}
            overview={project.overview}
            role={project.role}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'media':
        return (
          <ProjectMediaFields
            project={project}
            onChange={onChange}
          />
        );

      case 'links':
        return (
          <ProjectLinkFields
            projectId={project.id}
            live={project.url}
            source={project.sourceUrl}
            writeup={project.writeupUrl}
            video={project.videoPageUrl}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'tech':
        return (
          <ProjectTechStackFields
            projectId={project.id}
            stack={project.techStack}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'lists':
        return (
          <ProjectListFields 
            projectId={project.id}
            features={project.features}
            metrics={project.metrics}
            improvements={project.improvements}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'challenges':
        return (
          <ProjectChallengeFields 
            projectId={project.id}
            challenges={challenges}
            handleFieldChange={handleFieldChange}
          />
        );

      default:
        return null;
    }
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

      <CardSelector
        cardTypeId="Project Subsection"
        cards={PROJECT_EDITOR_SECTIONS}
        activeId={activeSectionId}
        onSelect={setActiveSectionId}
        reorderable={false}
      />

      {renderActiveSection()}
    </div>
  );
}

export default ProjectEditor;
