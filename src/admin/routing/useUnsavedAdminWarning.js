import { useEffect } from 'react';

const UNSAVED_ADMIN_WARNING =
  'You have unsaved admin changes. Leave without saving?';

export function useUnsavedAdminWarning(hasUnsavedChanges) {
  useEffect(() => {
    if (typeof window === 'undefined' || !hasUnsavedChanges) {
      return undefined;
    }

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = UNSAVED_ADMIN_WARNING;
      return UNSAVED_ADMIN_WARNING;
    };

    window.addEventListener('beforeunload', warnBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

export default useUnsavedAdminWarning;
