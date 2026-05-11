import { loadAboutData } from './about.js';
import { loadContactData } from './contact.js';
import { loadProjectsData } from './projects.js';
import { sendJson, sendRouteError } from './responses.js';

export async function loadBootstrapData() {
  const [about, projects, contact] = await Promise.all([
    loadAboutData(),
    loadProjectsData(),
    loadContactData(),
  ]);

  return { about, projects, contact };
}

export async function handleBootstrapRead(_req, res) {
  try {
    sendJson(res, 200, await loadBootstrapData());
  } catch (error) {
    sendRouteError(res, error);
  }
}
