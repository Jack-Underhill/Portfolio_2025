import { useCallback, useMemo, useState } from 'react';

import {
  clearAdminWorkflowStateAfterSave,
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
    resetWorkflowState,
  };
}
