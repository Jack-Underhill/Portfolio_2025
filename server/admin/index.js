import { createServer } from 'node:http';

import { handleAboutRead, handleAboutWrite } from './routes/about.js';
import { handleBootstrapRead, handleSaveAllWrite } from './routes/bootstrap.js';
import { handleContactRead, handleContactWrite } from './routes/contact.js';
import { handleHealth } from './routes/health.js';
import { handleProjectsRead, handleProjectsWrite } from './routes/projects.js';
import { sendJson } from './routes/responses.js';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8787;
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

function assertLocalAdminAllowed(hostname) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to start the local admin backend with NODE_ENV=production.');
    process.exit(1);
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    console.error(`Refusing to start the local admin backend on non-loopback host "${hostname}".`);
    process.exit(1);
  }
}

const host = process.env.ADMIN_SERVER_HOST || DEFAULT_HOST;
const port = Number.parseInt(process.env.ADMIN_SERVER_PORT || `${DEFAULT_PORT}`, 10);

function applyCorsHeaders(res) {
  res.setHeader('access-control-allow-origin', 'http://localhost:5173');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
}

function handleNotFound(res) {
  sendJson(res, 404, { error: 'Not found' });
}

function handleRequest(req, res) {
  applyCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || host}`);

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/health') {
    handleHealth(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/about') {
    handleAboutRead(req, res);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin-api/about') {
    handleAboutWrite(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/projects') {
    handleProjectsRead(req, res);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin-api/projects') {
    handleProjectsWrite(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/contact') {
    handleContactRead(req, res);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin-api/contact') {
    handleContactWrite(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/bootstrap') {
    handleBootstrapRead(req, res);
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/admin-api/save-all') {
    handleSaveAllWrite(req, res);
    return;
  }

  handleNotFound(res);
}

assertLocalAdminAllowed(host);

const server = createServer(handleRequest);

server.listen(port, host, () => {
  console.log(`Admin backend listening at http://${host}:${port}`);
});
