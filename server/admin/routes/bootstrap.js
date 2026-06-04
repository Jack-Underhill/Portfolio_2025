import { loadAboutData, saveAboutData } from './about.js';
import { attachContactFiles, loadContactData, saveContactData } from './contact.js';
import { loadCredentialsData, saveCredentialsData } from './credentials.js';
import { attachProjectFiles, loadProjectsData, saveProjectsData } from './projects.js';
import { loadSkillsData, saveSkillsData } from './skills.js';
import {
  applyMultipartFiles,
  assertPlainObject,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';

export async function loadBootstrapData() {
  const [about, projects, contact, skills, credentials] = await Promise.all([
    loadAboutData(),
    loadProjectsData(),
    loadContactData(),
    loadSkillsData(),
    loadCredentialsData(),
  ]);

  return { about, projects, contact, skills, credentials };
}

export async function handleBootstrapRead(_req, res) {
  try {
    sendJson(res, 200, await loadBootstrapData());
  } catch (error) {
    sendRouteError(res, error);
  }
}

export async function handleSaveAllWrite(req, res) {
  try {
    const { body, form } = await parseAdminRequest(req);
    assertPlainObject(body, 'save-all payload');
    assertPlainObject(body.about, 'about payload');
    assertPlainObject(body.projects, 'projects payload');
    assertPlainObject(body.contact, 'contact payload');
    assertPlainObject(body.skills, 'skills payload');
    if (body.credentials != null) {
      assertPlainObject(body.credentials, 'credentials payload');
    }

    applyMultipartFiles(body.about, form, [
      {
        names: ['about.profileImageFile', 'profileImageFile'],
        set: (about, file) => {
          about.profileImageFile = file;
        },
      },
      {
        names: ['about.resumeFile', 'resumeFile'],
        set: (about, file) => {
          about.resumeFile = file;
        },
      },
    ]);
    attachProjectFiles(body.projects, form);
    attachContactFiles(body.contact, form);

    const credentialsPromise = body.credentials == null
      ? loadCredentialsData()
      : saveCredentialsData(body.credentials);

    const [about, projects, contact, skills, credentials] = await Promise.all([
      saveAboutData(body.about),
      saveProjectsData(body.projects),
      saveContactData(body.contact),
      saveSkillsData(body.skills),
      credentialsPromise,
    ]);

    sendJson(res, 200, { about, projects, contact, skills, credentials });
  } catch (error) {
    sendRouteError(res, error);
  }
}
