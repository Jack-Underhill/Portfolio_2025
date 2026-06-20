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

export function findProjectEditorSection(sectionId) {
  return PROJECT_EDITOR_SECTIONS.find((section) => section.id === sectionId) || null;
}
