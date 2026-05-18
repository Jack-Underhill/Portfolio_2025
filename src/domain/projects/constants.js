import { PUBLIC_ROUTES } from '../../runtime/paths.js';

export const PROJECT_ROUTE_PATTERN = new RegExp(`^${PUBLIC_ROUTES.PROJECT_BASE}/([^/]+)/?$`, 'i');

export const PROJECT_TECH_STACK_KEYS = Object.freeze([
  'frontend',
  'backend',
  'data',
  'infrastructure',
]);

export const PROJECT_TYPES = Object.freeze([
  'school',
  'internship',
  'personal',
  'client',
  'open-source',
]);

export const PROJECT_TYPE_OPTIONS = Object.freeze([
  { value: 'school', label: 'School' },
  { value: 'internship', label: 'Internship' },
  { value: 'personal', label: 'Personal' },
  { value: 'client', label: 'Client' },
  { value: 'open-source', label: 'Open source' },
]);

export const EMPTY_PROJECT_TECH_STACK = Object.freeze({
  frontend: Object.freeze(['']),
  backend: Object.freeze(['']),
  data: Object.freeze(['']),
  infrastructure: Object.freeze(['']),
});
