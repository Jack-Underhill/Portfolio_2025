export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export function sendRouteError(res, error) {
  const message = error?.message || 'Admin backend request failed';
  sendJson(res, 500, { error: message });
}
