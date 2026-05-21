const DEFAULT_ADMIN_API_BASE_URL = 'http://localhost:8787/admin-api';

const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_BASE_URL || DEFAULT_ADMIN_API_BASE_URL
).replace(/\/$/, '');

export async function loadAdminData() {
  return getJson('/bootstrap');
}

export async function saveAdminData({ aboutState, projectsState, contactState, skillsState }) {
  const data = await postAdminPayload('/save-all', {
    about: aboutState,
    projects: projectsState,
    contact: contactState,
    skills: skillsState,
  });

  return {
    about: data.about,
    projects: data.projects,
    contact: data.contact,
    skills: data.skills,
  };
}

export async function loadAbout() {
  return getJson('/about');
}

export async function saveAbout(state) {
  return postAdminPayload('/about', { about: state });
}

export async function loadProjects() {
  return getJson('/projects');
}

export async function saveProjects(state) {
  return postAdminPayload('/projects', { projects: state });
}

export async function validateProjectDraft(state) {
  return postAdminPayload('/projects/validate', { projects: state });
}

export async function loadContact() {
  return getJson('/contact');
}

export async function saveContact(state) {
  return postAdminPayload('/contact', { contact: state });
}

export async function loadSkills() {
  return getJson('/skills');
}

export async function saveSkills(state) {
  return postAdminPayload('/skills', { skills: state });
}

async function getJson(path) {
  return requestJson(path);
}

async function postAdminPayload(path, payload) {
  const files = [];
  const jsonPayload = clonePayload(payload, files);

  if (!files.length) {
    return requestJson(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(jsonPayload),
    });
  }

  const form = new FormData();
  form.set('payload', JSON.stringify(jsonPayload));

  for (const { path: fieldPath, file } of files) {
    form.set(fieldPath, file);
  }

  return requestJson(path, {
    method: 'POST',
    body: form,
  });
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, options);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.error || `Admin request failed with ${response.status}`);
  }

  return data;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Admin backend returned an invalid JSON response');
  }
}

function clonePayload(value, files, path = []) {
  if (isUploadFile(value)) {
    files.push({ path: path.join('.'), file: value });
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => clonePayload(item, files, [...path, index]));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        clonePayload(entry, files, [...path, key]),
      ]),
    );
  }

  return value;
}

function isUploadFile(value) {
  return typeof File !== 'undefined' && value instanceof File;
}
