export const PROJECT_AGENT_INTENT_IDS = Object.freeze(['revise', 'review']);

export const PROJECT_AGENT_RUN_PLAN_IDS = Object.freeze([
  'generate-new-case-study',
  'revise-current-case-study',
  'revise-with-source-context',
  'review-current-case-study',
]);

const PROJECT_AGENT_INTENTS = Object.freeze({
  revise: Object.freeze({
    id: 'revise',
    label: 'Revise draft',
    summary: 'Edit the active unsaved draft by returning supported patch fields.',
  }),
  review: Object.freeze({
    id: 'review',
    label: 'Review only',
    summary: 'Analyze the active draft without returning draft edits.',
  }),
});

const PROJECT_AGENT_RUN_PLANS = Object.freeze({
  'generate-new-case-study': Object.freeze({
    id: 'generate-new-case-study',
    intent: 'revise',
    label: 'Generate new case study',
    summary: 'Generate a coherent case-study draft from a fresh or effectively empty draft.',
    responsibilities: Object.freeze([
      'Treat the active draft as a fresh working draft.',
      'Build a coherent case-study draft from the owner instructions and available draft context.',
      'Do not invent URLs, results, metrics, or facts not supported by instructions or context.',
    ]),
  }),
  'revise-current-case-study': Object.freeze({
    id: 'revise-current-case-study',
    intent: 'revise',
    label: 'Revise current case study',
    summary: 'Revise the current project draft using the owner instructions.',
    responsibilities: Object.freeze([
      'Return a minimal patch for the current project draft.',
      'Prioritize the owner instructions while preserving accurate existing context.',
      'Use empty supported fields only when the owner clearly asks to clear content.',
      'Do not produce review-only commentary instead of a patch when a concrete revision is possible.',
    ]),
  }),
  'revise-with-source-context': Object.freeze({
    id: 'revise-with-source-context',
    intent: 'revise',
    label: 'Revise with source context',
    summary: 'Revise the current draft using owner instructions and supplied source context.',
    responsibilities: Object.freeze([
      'Use source context as evidence for supported draft revisions.',
      'Preserve accurate current draft context unless better source-backed evidence is available.',
      'Call out assumptions or source gaps in notes and warnings.',
    ]),
  }),
  'review-current-case-study': Object.freeze({
    id: 'review-current-case-study',
    intent: 'review',
    label: 'Review current case study',
    summary: 'Review the current draft without editing it.',
    responsibilities: Object.freeze([
      'Analyze only and return an empty patch.',
      'Put findings, missing evidence, contradictions, bloat, stale content, and next actions in notes and warnings.',
      'Do not rewrite fields, even when issues are found.',
    ]),
  }),
});

const TEXT_CONTENT_FIELDS = Object.freeze([
  'title',
  'description',
  'overview',
  'role',
  'url',
  'sourceUrl',
  'writeupUrl',
  'videoPageUrl',
]);

const STRING_LIST_CONTENT_FIELDS = Object.freeze([
  'features',
  'metrics',
  'improvements',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasTextListContent(value) {
  return Array.isArray(value) && value.some(hasText);
}

function hasChallengeContent(value) {
  return Array.isArray(value) && value.some((item) => (
    isPlainObject(item)
      && (hasText(item.challenge) || hasText(item.solution) || hasText(item.result))
  ));
}

function hasTechStackContent(value) {
  return isPlainObject(value)
    && Object.values(value).some((items) => hasTextListContent(items));
}

function getDraftFromProjectContext(projectContext) {
  if (!isPlainObject(projectContext)) return {};
  if (isPlainObject(projectContext.draft)) return projectContext.draft;

  return projectContext;
}

export class ProjectAgentIntentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProjectAgentIntentError';
    this.type = 'invalid_intent';
  }
}

export function getProjectAgentIntent(intentId) {
  const normalizedIntentId = typeof intentId === 'string' ? intentId.trim() : '';
  const intent = PROJECT_AGENT_INTENTS[normalizedIntentId];

  if (!intent) {
    throw new ProjectAgentIntentError(
      `Unsupported project agent intent. Supported intents: ${PROJECT_AGENT_INTENT_IDS.join(', ')}.`,
    );
  }

  return intent;
}

export function listProjectAgentIntents() {
  return PROJECT_AGENT_INTENT_IDS.map((intentId) => PROJECT_AGENT_INTENTS[intentId]);
}

export function getProjectAgentRunPlan(runPlanId) {
  const normalizedRunPlanId = typeof runPlanId === 'string' ? runPlanId.trim() : '';
  const runPlan = PROJECT_AGENT_RUN_PLANS[normalizedRunPlanId];

  if (!runPlan) {
    throw new ProjectAgentIntentError(
      `Unsupported project agent run plan. Supported run plans: ${PROJECT_AGENT_RUN_PLAN_IDS.join(', ')}.`,
    );
  }

  return runPlan;
}

export function isProjectAgentDraftEffectivelyEmpty(projectContext) {
  const draft = getDraftFromProjectContext(projectContext);

  if (TEXT_CONTENT_FIELDS.some((field) => hasText(draft[field]))) {
    return false;
  }

  if (STRING_LIST_CONTENT_FIELDS.some((field) => hasTextListContent(draft[field]))) {
    return false;
  }

  if (hasChallengeContent(draft.challenges)) {
    return false;
  }

  if (hasTechStackContent(draft.techStack)) {
    return false;
  }

  return true;
}

export function createProjectAgentRunPlan({
  intent,
  projectContext,
  hasSourceContext = false,
} = {}) {
  const resolvedIntent = getProjectAgentIntent(intent);

  if (resolvedIntent.id === 'review') {
    return getProjectAgentRunPlan('review-current-case-study');
  }

  if (hasSourceContext) {
    return getProjectAgentRunPlan('revise-with-source-context');
  }

  if (isProjectAgentDraftEffectivelyEmpty(projectContext)) {
    return getProjectAgentRunPlan('generate-new-case-study');
  }

  return getProjectAgentRunPlan('revise-current-case-study');
}
