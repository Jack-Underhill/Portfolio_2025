export const PROJECT_ROUTE_PATTERN = /^\/p\/([^/]+)\/?$/i;

export const PROJECT_TECH_STACK_KEYS = Object.freeze([
  'frontend',
  'backend',
  'data',
  'infrastructure',
]);

export const EMPTY_PROJECT_TECH_STACK = Object.freeze({
  frontend: Object.freeze(['']),
  backend: Object.freeze(['']),
  data: Object.freeze(['']),
  infrastructure: Object.freeze(['']),
});
