export function validSourceValidation(metadata = {}) {
  return {
    ok: true,
    ...metadata,
  };
}

export function invalidSourceValidation(reason, metadata = {}) {
  return {
    ok: false,
    reason,
    ...metadata,
  };
}
