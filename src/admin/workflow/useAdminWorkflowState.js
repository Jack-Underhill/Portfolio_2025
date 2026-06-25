import { useCallback, useMemo, useState } from 'react';

import {
  applyAdminWorkflowBranchEdit,
  beginAdminWorkflowValidation,
  clearAdminWorkflowStateAfterSave,
  completeAdminWorkflowBranchValidationWithFailure,
  completeAdminWorkflowValidationSuccessfully,
  createAdminWorkflowState,
  hasAdminWorkflowUnsavedChanges,
  markAdminWorkflowLocationsDirty,
} from './adminWorkflowState.js';

export default function useAdminWorkflowState() {
  const [workflowState, setWorkflowState] = useState(createAdminWorkflowState);

  const markLocationsDirty = useCallback((locationIds) => {
    setWorkflowState((currentState) => (
      markAdminWorkflowLocationsDirty(currentState, locationIds)
    ));
  }, []);

  const markBranchLocationsDirty = useCallback((parentLocationId, locationIds) => {
    setWorkflowState((currentState) => (
      applyAdminWorkflowBranchEdit(
        currentState,
        parentLocationId,
        locationIds,
      )
    ));
  }, []);

  const beginValidation = useCallback((locationIds) => {
    setWorkflowState((currentState) => (
      beginAdminWorkflowValidation(currentState, locationIds)
    ));
  }, []);

  const completeValidationSuccessfully = useCallback((locationIds) => {
    setWorkflowState((currentState) => (
      completeAdminWorkflowValidationSuccessfully(currentState, locationIds)
    ));
  }, []);

  const completeBranchValidationWithFailure = useCallback((parentLocationId) => {
    setWorkflowState((currentState) => (
      completeAdminWorkflowBranchValidationWithFailure(
        currentState,
        parentLocationId,
      )
    ));
  }, []);

  const resetWorkflowState = useCallback(() => {
    setWorkflowState(clearAdminWorkflowStateAfterSave());
  }, []);

  const hasUnsavedChanges = useMemo(
    () => hasAdminWorkflowUnsavedChanges(workflowState),
    [workflowState],
  );

  return {
    workflowState,
    hasUnsavedChanges,
    markLocationsDirty,
    markBranchLocationsDirty,
    beginValidation,
    completeValidationSuccessfully,
    completeBranchValidationWithFailure,
    resetWorkflowState,
  };
}
