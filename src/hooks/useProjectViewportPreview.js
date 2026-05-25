import { useEffect, useRef } from 'react';

import usePrefersReducedMotion from './usePrefersReducedMotion';
import useViewportActivationGroup from './useViewportActivationGroup';

function useProjectViewportPreview({
  projects = [],
  isModalOpen = false,
  lastInputRef,
  requestPreview,
  clearPreview,
} = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportPreviewIdRef = useRef(null);
  const { activeId: viewportActiveProjectId, registerItem } = useViewportActivationGroup({
    disabled: isModalOpen || prefersReducedMotion || projects.length === 0,
  });

  useEffect(() => {
    const previousViewportPreviewId = viewportPreviewIdRef.current;
    const isKeyboardNavigation = lastInputRef?.current === 'keyboard';

    if (isModalOpen || prefersReducedMotion || viewportActiveProjectId === null) {
      if (
        previousViewportPreviewId !== null
        && (isModalOpen || prefersReducedMotion || !isKeyboardNavigation)
      ) {
        clearPreview?.(previousViewportPreviewId);
        viewportPreviewIdRef.current = null;
      }

      return;
    }

    if (isKeyboardNavigation) return;

    viewportPreviewIdRef.current = viewportActiveProjectId;
    requestPreview?.(viewportActiveProjectId);
  }, [
    clearPreview,
    isModalOpen,
    lastInputRef,
    prefersReducedMotion,
    requestPreview,
    viewportActiveProjectId,
  ]);

  useEffect(() => () => {
    if (viewportPreviewIdRef.current !== null) {
      clearPreview?.(viewportPreviewIdRef.current);
    }
  }, [clearPreview]);

  return {
    registerItem,
  };
}

export default useProjectViewportPreview;
