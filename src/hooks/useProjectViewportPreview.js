import { useEffect, useRef } from 'react';

import usePrefersReducedMotion from './usePrefersReducedMotion';
import useViewportActivationGroup from './useViewportActivationGroup';

function useProjectViewportPreview({
  projects = [],
  isModalOpen = false,
  disabled = false,
  lastInputRef,
  requestPreview,
  clearPreview,
} = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportPreviewIdRef = useRef(null);
  const isViewportPreviewDisabled = disabled || isModalOpen || prefersReducedMotion || projects.length === 0;
  const { activeId: viewportActiveProjectId, registerItem } = useViewportActivationGroup({
    disabled: isViewportPreviewDisabled,
  });

  useEffect(() => {
    const previousViewportPreviewId = viewportPreviewIdRef.current;
    const isKeyboardNavigation = lastInputRef?.current === 'keyboard';

    if (isViewportPreviewDisabled || viewportActiveProjectId === null) {
      if (
        previousViewportPreviewId !== null
        && (isViewportPreviewDisabled || !isKeyboardNavigation)
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
    isViewportPreviewDisabled,
    lastInputRef,
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
