import { BadRequestError, assertPlainObject } from './requestBody.js';

const SHORT_TEXT_LIMIT = 240;
const MEDIUM_TEXT_LIMIT = 1000;
const LONG_TEXT_LIMIT = 6000;
const URL_LIMIT = 2000;

export const FILE_LIMITS = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    extensions: ['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'],
    mimePrefixes: ['image/'],
  },
  pdf: {
    maxBytes: 10 * 1024 * 1024,
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
  },
  video: {
    maxBytes: 25 * 1024 * 1024,
    extensions: ['.mp4', '.mov', '.webm'],
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
};

export function validateAboutState(state) {
  assertPlainObject(state, 'about payload');

  return {
    ...state,
    profileImageFile: validateUploadFile(
      state.profileImageFile,
      'profile image',
      FILE_LIMITS.image,
    ),
    profileImageUrl: optionalHttpUrl(state.profileImageUrl, 'profile image URL'),
    professionTitle: optionalString(
      state.professionTitle,
      'profession title',
      SHORT_TEXT_LIMIT,
    ),
    professionBio: optionalString(state.professionBio, 'profession bio', LONG_TEXT_LIMIT),
    resumeFile: validateUploadFile(state.resumeFile, 'resume PDF', FILE_LIMITS.pdf),
    resumeUrl: optionalHttpUrl(state.resumeUrl, 'resume URL'),
  };
}

export function validateProjectsState(state) {
  assertPlainObject(state, 'projects payload');

  return {
    projectBio: optionalString(state.projectBio, 'project bio', LONG_TEXT_LIMIT),
    projects: normalizeProjectArray(state.projects),
  };
}

export function validateContactState(state) {
  assertPlainObject(state, 'contact payload');

  return {
    ...state,
    proficientTechs: normalizeStringList(
      state.proficientTechs,
      'proficientTechs',
      { maxItems: 120, maxLength: SHORT_TEXT_LIMIT },
    ),
    experiencingTechs: normalizeStringList(
      state.experiencingTechs,
      'experiencingTechs',
      { maxItems: 120, maxLength: SHORT_TEXT_LIMIT },
    ),
    socialLinks: normalizeSocialLinks(state.socialLinks),
  };
}

export function optionalString(value, label, maxLength = MEDIUM_TEXT_LIMIT) {
  if (value == null) return '';
  if (typeof value !== 'string') {
    throw new BadRequestError(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new BadRequestError(`${label} must be ${maxLength} characters or fewer`);
  }

  return trimmed;
}

export function optionalHttpUrl(value, label) {
  const trimmed = optionalString(value, label, URL_LIMIT);
  if (!trimmed) return '';

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestError(`${label} must be a valid URL`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError(`${label} must use http or https`);
  }

  return trimmed;
}

export function optionalPositiveInteger(value, label) {
  if (value == null || value === '') return null;

  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new BadRequestError(`${label} must be a positive integer`);
  }

  return number;
}

export function validateUploadFile(file, label, rules) {
  if (!file) return null;
  if (!isUploadedFile(file)) {
    throw new BadRequestError(`${label} must be an uploaded file`);
  }

  if (file.size > rules.maxBytes) {
    throw new BadRequestError(`${label} must be ${formatBytes(rules.maxBytes)} or smaller`);
  }

  const type = String(file.type || '').toLowerCase();
  const extension = fileExtension(file.name);

  const matchesType =
    rules.mimeTypes?.includes(type) ||
    rules.mimePrefixes?.some((prefix) => type.startsWith(prefix));
  const matchesExtension = rules.extensions.includes(extension);

  if (!matchesType && !matchesExtension) {
    throw new BadRequestError(`${label} must be an allowed file type`);
  }

  return file;
}

function normalizeProjectArray(projects) {
  const input = requiredArray(projects, 'projects', 80);
  const normalized = [];
  const seenIds = new Set();

  for (let index = 0; index < input.length; index += 1) {
    const project = input[index];
    assertPlainObject(project, `project ${index + 1}`);

    const id = optionalPositiveInteger(project.id, `project ${index + 1} id`);
    if (id) {
      if (seenIds.has(id)) {
        throw new BadRequestError(`project id ${id} appears more than once`);
      }
      seenIds.add(id);
    }

    normalized.push({
      ...project,
      id,
      permalink: optionalString(project.permalink, `project ${index + 1} permalink`, SHORT_TEXT_LIMIT),
      title: optionalString(project.title, `project ${index + 1} title`, SHORT_TEXT_LIMIT),
      description: optionalString(
        project.description,
        `project ${index + 1} description`,
        LONG_TEXT_LIMIT,
      ),
      url: optionalHttpUrl(project.url, `project ${index + 1} live URL`),
      imageUrl: optionalHttpUrl(project.imageUrl, `project ${index + 1} image URL`),
      videoUrl: optionalHttpUrl(project.videoUrl, `project ${index + 1} video URL`),
      architectureImageUrl: optionalHttpUrl(
        project.architectureImageUrl,
        `project ${index + 1} architecture image URL`,
      ),
      overview: optionalString(project.overview, `project ${index + 1} overview`, LONG_TEXT_LIMIT),
      role: optionalString(project.role, `project ${index + 1} role`, MEDIUM_TEXT_LIMIT),
      sourceUrl: optionalHttpUrl(project.sourceUrl, `project ${index + 1} source URL`),
      writeupUrl: optionalHttpUrl(project.writeupUrl, `project ${index + 1} writeup URL`),
      videoPageUrl: optionalHttpUrl(project.videoPageUrl, `project ${index + 1} video page URL`),
      imageFile: validateUploadFile(
        project.imageFile,
        `project ${index + 1} image`,
        FILE_LIMITS.image,
      ),
      videoFile: validateUploadFile(
        project.videoFile,
        `project ${index + 1} video`,
        FILE_LIMITS.video,
      ),
      architectureImageFile: validateUploadFile(
        project.architectureImageFile,
        `project ${index + 1} architecture image`,
        FILE_LIMITS.image,
      ),
      techStack: normalizeTechStack(project.techStack, `project ${index + 1} tech stack`),
      techTags: normalizeStringList(project.techTags ?? [], `project ${index + 1} tech tags`, {
        maxItems: 80,
        maxLength: SHORT_TEXT_LIMIT,
      }),
      features: normalizeOptionalStringList(project.features, `project ${index + 1} features`),
      metrics: normalizeOptionalStringList(project.metrics, `project ${index + 1} metrics`),
      challenges: normalizeChallenges(project.challenges, `project ${index + 1} challenges`),
      improvements: normalizeOptionalStringList(
        project.improvements,
        `project ${index + 1} improvements`,
      ),
      published: optionalBoolean(project.published, `project ${index + 1} published`, true),
    });
  }

  return normalized;
}

function normalizeSocialLinks(links) {
  const input = requiredArray(links, 'socialLinks', 40);

  return input.map((link, index) => {
    assertPlainObject(link, `social link ${index + 1}`);

    return {
      ...link,
      id: optionalPositiveInteger(link.id, `social link ${index + 1} id`),
      label: optionalString(link.label, `social link ${index + 1} label`, SHORT_TEXT_LIMIT),
      url: optionalHttpUrl(link.url, `social link ${index + 1} URL`),
      iconUrl: optionalHttpUrl(link.iconUrl, `social link ${index + 1} icon URL`),
      iconFile: validateUploadFile(
        link.iconFile,
        `social link ${index + 1} icon`,
        FILE_LIMITS.image,
      ),
    };
  });
}

function normalizeTechStack(techStack, label) {
  if (techStack == null) return null;
  assertPlainObject(techStack, label);

  return {
    frontend: normalizeStringList(techStack.frontend ?? [], `${label} frontend`, {
      maxItems: 40,
      maxLength: SHORT_TEXT_LIMIT,
    }),
    backend: normalizeStringList(techStack.backend ?? [], `${label} backend`, {
      maxItems: 40,
      maxLength: SHORT_TEXT_LIMIT,
    }),
    data: normalizeStringList(techStack.data ?? [], `${label} data`, {
      maxItems: 40,
      maxLength: SHORT_TEXT_LIMIT,
    }),
    infrastructure: normalizeStringList(techStack.infrastructure ?? [], `${label} infrastructure`, {
      maxItems: 40,
      maxLength: SHORT_TEXT_LIMIT,
    }),
  };
}

function normalizeOptionalStringList(value, label) {
  if (value == null) return null;
  return normalizeStringList(value, label, {
    maxItems: 80,
    maxLength: MEDIUM_TEXT_LIMIT,
  });
}

function normalizeStringList(value, label, { maxItems, maxLength }) {
  return requiredArray(value, label, maxItems)
    .map((item, index) => optionalString(item, `${label} item ${index + 1}`, maxLength))
    .filter(Boolean);
}

function normalizeChallenges(value, label) {
  if (value == null) return null;

  return requiredArray(value, label, 40)
    .map((challenge, index) => {
      assertPlainObject(challenge, `${label} item ${index + 1}`);

      return {
        challenge: optionalString(
          challenge.challenge,
          `${label} item ${index + 1} challenge`,
          MEDIUM_TEXT_LIMIT,
        ),
        solution: optionalString(
          challenge.solution,
          `${label} item ${index + 1} solution`,
          MEDIUM_TEXT_LIMIT,
        ),
        result: optionalString(
          challenge.result,
          `${label} item ${index + 1} result`,
          MEDIUM_TEXT_LIMIT,
        ),
      };
    })
    .filter((item) => item.challenge || item.solution || item.result);
}

function requiredArray(value, label, maxItems) {
  if (!Array.isArray(value)) {
    throw new BadRequestError(`${label} must be an array`);
  }

  if (value.length > maxItems) {
    throw new BadRequestError(`${label} must include ${maxItems} items or fewer`);
  }

  return value;
}

function optionalBoolean(value, label, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'boolean') {
    throw new BadRequestError(`${label} must be a boolean`);
  }

  return value;
}

function isUploadedFile(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.name === 'string' &&
    value.size > 0
  );
}

function fileExtension(name) {
  const value = String(name || '').toLowerCase();
  const dot = value.lastIndexOf('.');
  return dot === -1 ? '' : value.slice(dot);
}

function formatBytes(bytes) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}
