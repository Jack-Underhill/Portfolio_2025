import { EMPTY_PROJECT_TECH_STACK } from './constants.js';

function createEditableTechStack() {
  return Object.fromEntries(
    Object.entries(EMPTY_PROJECT_TECH_STACK).map(([key, value]) => [key, [...value]])
  );
}

export function createEmptyProjectDetails() {
  return {
    overview: null,
    role: null,
    techStack: null,
    architectureImageUrl: null,
    features: [],
    metrics: null,
    challenges: [],
    improvements: [],
  };
}

export function createEmptyProjectDraft({ id = null, sortOrder = 0 } = {}) {
  return {
    id,

    imageFile: null,
    imageUrl: '',
    architectureImageFile: null,
    architectureImageUrl: '',
    videoFile: null,
    videoUrl: '',

    title: '',
    description: '',
    techTags: [''],
    url: '',

    permalink: '',
    overview: '',
    role: '',
    sourceUrl: '',
    writeupUrl: '',
    videoPageUrl: '',

    techStack: createEditableTechStack(),

    features: [''],
    metrics: [''],
    challenges: [],
    improvements: [''],

    published: true,
    sortOrder,
  };
}
