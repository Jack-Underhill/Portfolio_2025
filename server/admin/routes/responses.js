export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export function sendRouteError(res, error) {
  const message = error?.message || 'Admin backend request failed';
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  const logMessage = `[admin] ${statusCode} ${message}`;
  const payload = { error: message };

  if (statusCode >= 500) {
    console.error(logMessage, error?.stack || error);
  } else {
    console.warn(logMessage);
  }

  if (isPlainObject(error?.clientDetails)) {
    payload.details = error.clientDetails;
  }

  sendJson(res, statusCode, payload);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
