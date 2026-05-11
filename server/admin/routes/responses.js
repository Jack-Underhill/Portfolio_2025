export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export function sendRouteError(res, error) {
  const message = error?.message || 'Admin backend request failed';
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  sendJson(res, statusCode, { error: message });
}
