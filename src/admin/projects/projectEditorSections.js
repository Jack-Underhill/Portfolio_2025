export const PROJECT_EDITOR_SECTIONS = [
  { id: 'classification', title: 'Classification' },
  { id: 'intro', title: 'Intro' },
  { id: 'media', title: 'Media' },
  { id: 'links', title: 'Links' },
  { id: 'tech', title: 'Tech' },
  { id: 'lists', title: 'Lists' },
  { id: 'challenges', title: 'Challenges' },
];

export const DEFAULT_PROJECT_EDITOR_SECTION = PROJECT_EDITOR_SECTIONS[0];
export const PROJECTS_WORKFLOW_LOCATION_ID = 'projects';

export const PROJECT_FIELD_SECTION_IDS = Object.freeze({
  published: 'classification',
  featuredRank: 'classification',
  projectType: 'classification',
  labels: 'classification',
  title: 'intro',
  description: 'intro',
  overview: 'intro',
  role: 'intro',
  imageFile: 'media',
  architectureImageFile: 'media',
  videoFile: 'media',
  url: 'links',
  sourceUrl: 'links',
  writeupUrl: 'links',
  videoPageUrl: 'links',
  techStack: 'tech',
  features: 'lists',
  metrics: 'lists',
  improvements: 'lists',
  challenges: 'challenges',
});

export function findProjectEditorSection(sectionId) {
  return PROJECT_EDITOR_SECTIONS.find((section) => section.id === sectionId) || null;
}

export function getProjectEditorSectionElementId(sectionId) {
  return `project-editor-${sectionId}`;
}

export function getProjectWorkflowLocationId(sectionId) {
  return `${PROJECTS_WORKFLOW_LOCATION_ID}/${sectionId}`;
}

export function getProjectFieldWorkflowLocationIds(fieldIds) {
  return [...new Set(
    fieldIds
      .map((fieldId) => PROJECT_FIELD_SECTION_IDS[fieldId])
      .filter(Boolean)
      .map(getProjectWorkflowLocationId),
  )];
}
