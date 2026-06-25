import { getAdminWorkflowBranchLocationIds } from '../routing/adminRoutes.js';

export const ADMIN_WORKFLOW_VALIDATION = Object.freeze({
  NONE: 'none',
  VALIDATING: 'validating',
  VALID: 'valid',
  INVALID: 'invalid',
});

export const ADMIN_WORKFLOW_VISUAL_STATE = Object.freeze({
  NORMAL: 'normal',
  DIRTY: 'dirty',
  VALIDATING: 'validating',
  VALID: 'valid',
  INVALID: 'invalid',
});

const NORMAL_LOCATION_STATE = Object.freeze({
  dirty: false,
  validation: ADMIN_WORKFLOW_VALIDATION.NONE,
});

export function createAdminWorkflowState() {
  return {};
}

export function getAdminWorkflowLocationState(workflowState, locationId) {
  return workflowState[locationId] || NORMAL_LOCATION_STATE;
}

function updateLocations(workflowState, locationIds, updateLocation) {
  const nextState = { ...workflowState };

  [...new Set(locationIds)].forEach((locationId) => {
    nextState[locationId] = updateLocation(
      getAdminWorkflowLocationState(workflowState, locationId),
    );
  });

  return nextState;
}

export function markAdminWorkflowLocationsDirty(workflowState, locationIds) {
  return updateLocations(workflowState, locationIds, (locationState) => ({
    ...locationState,
    dirty: true,
  }));
}

export function clearAdminWorkflowBranchValidation(workflowState, parentLocationId) {
  return updateLocations(
    workflowState,
    getAdminWorkflowBranchLocationIds(parentLocationId),
    (locationState) => ({
      ...locationState,
      validation: ADMIN_WORKFLOW_VALIDATION.NONE,
    }),
  );
}

export function applyAdminWorkflowBranchEdit(
  workflowState,
  parentLocationId,
  locationIds,
) {
  return markAdminWorkflowLocationsDirty(
    clearAdminWorkflowBranchValidation(workflowState, parentLocationId),
    locationIds,
  );
}

export function beginAdminWorkflowValidation(workflowState, locationIds) {
  return updateLocations(workflowState, locationIds, (locationState) => ({
    ...locationState,
    validation: ADMIN_WORKFLOW_VALIDATION.VALIDATING,
  }));
}

export function completeAdminWorkflowValidationSuccessfully(workflowState, locationIds) {
  return updateLocations(workflowState, locationIds, (locationState) => ({
    ...locationState,
    validation: ADMIN_WORKFLOW_VALIDATION.VALID,
  }));
}

export function completeAdminWorkflowValidationWithFailure(workflowState, locationIds) {
  return updateLocations(workflowState, locationIds, (locationState) => ({
    ...locationState,
    validation: ADMIN_WORKFLOW_VALIDATION.INVALID,
  }));
}

export function completeAdminWorkflowBranchValidationWithFailure(
  workflowState,
  parentLocationId,
) {
  return completeAdminWorkflowValidationWithFailure(
    clearAdminWorkflowBranchValidation(workflowState, parentLocationId),
    [parentLocationId],
  );
}

export function clearAdminWorkflowStateAfterSave() {
  return createAdminWorkflowState();
}

export function preserveAdminWorkflowStateAfterFailedSave(workflowState) {
  return workflowState;
}

export function hasAdminWorkflowUnsavedChanges(workflowState) {
  return Object.values(workflowState).some((locationState) => locationState.dirty);
}

export function deriveAdminWorkflowVisualState(locationState = NORMAL_LOCATION_STATE) {
  if (locationState.validation === ADMIN_WORKFLOW_VALIDATION.INVALID) {
    return ADMIN_WORKFLOW_VISUAL_STATE.INVALID;
  }

  if (locationState.validation === ADMIN_WORKFLOW_VALIDATION.VALIDATING) {
    return ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING;
  }

  if (locationState.validation === ADMIN_WORKFLOW_VALIDATION.VALID) {
    return ADMIN_WORKFLOW_VISUAL_STATE.VALID;
  }

  if (locationState.dirty) {
    return ADMIN_WORKFLOW_VISUAL_STATE.DIRTY;
  }

  return ADMIN_WORKFLOW_VISUAL_STATE.NORMAL;
}

export function deriveCollapsedAdminWorkflowParentState({
  parentState = NORMAL_LOCATION_STATE,
  childStates = [],
}) {
  const parentVisualState = deriveAdminWorkflowVisualState(parentState);
  const childVisualStates = childStates.map(deriveAdminWorkflowVisualState);
  const allVisualStates = [parentVisualState, ...childVisualStates];

  if (allVisualStates.includes(ADMIN_WORKFLOW_VISUAL_STATE.INVALID)) {
    return ADMIN_WORKFLOW_VISUAL_STATE.INVALID;
  }

  if (allVisualStates.includes(ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING)) {
    return ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING;
  }

  if (allVisualStates.includes(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY)) {
    return ADMIN_WORKFLOW_VISUAL_STATE.DIRTY;
  }

  if (
    childVisualStates.length > 0
    && childVisualStates.every((state) => state === ADMIN_WORKFLOW_VISUAL_STATE.VALID)
    && [
      ADMIN_WORKFLOW_VISUAL_STATE.NORMAL,
      ADMIN_WORKFLOW_VISUAL_STATE.VALID,
    ].includes(parentVisualState)
  ) {
    return ADMIN_WORKFLOW_VISUAL_STATE.VALID;
  }

  if (
    childVisualStates.length === 0
    && parentVisualState === ADMIN_WORKFLOW_VISUAL_STATE.VALID
  ) {
    return ADMIN_WORKFLOW_VISUAL_STATE.VALID;
  }

  return ADMIN_WORKFLOW_VISUAL_STATE.NORMAL;
}

export function deriveExpandedAdminWorkflowParentState({
  parentState = NORMAL_LOCATION_STATE,
}) {
  return deriveAdminWorkflowVisualState(parentState);
}
