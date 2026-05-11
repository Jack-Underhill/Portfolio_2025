import { createServer } from 'node:http';

import { handleAboutRead } from './routes/about.js';
import { handleBootstrapRead } from './routes/bootstrap.js';
import { handleContactRead } from './routes/contact.js';
import { handleHealth } from './routes/health.js';
import { handleProjectsRead } from './routes/projects.js';
import { sendJson } from './routes/responses.js';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8787;

const host = process.env.ADMIN_SERVER_HOST || DEFAULT_HOST;
const port = Number.parseInt(process.env.ADMIN_SERVER_PORT || `${DEFAULT_PORT}`, 10);

function applyCorsHeaders(res) {
  res.setHeader('access-control-allow-origin', 'http://localhost:5173');
  res.setHeader('access-control-allow-methods', 'GET,OPTIONS');
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

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/projects') {
    handleProjectsRead(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/contact') {
    handleContactRead(req, res);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/admin-api/bootstrap') {
    handleBootstrapRead(req, res);
    return;
  }

  handleNotFound(res);
}

const server = createServer(handleRequest);

server.listen(port, host, () => {
  console.log(`Admin backend listening at http://${host}:${port}`);
});
