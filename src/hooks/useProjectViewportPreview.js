import { useEffect, useRef } from 'react';

import usePrefersReducedMotion from './usePrefersReducedMotion';
import useViewportActivationGroup from './useViewportActivationGroup';

function useProjectViewportPreview({
  projects = [],
  isModalOpen = false,
  disabled = false,
  isInteractionPreviewActive = false,
  requestPreview,
  clearPreview,
} = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportPreviewIdRef = useRef(null);
  const isInteractionPreviewActiveRef = useRef(isInteractionPreviewActive);
  const isViewportPreviewDisabled = disabled || isModalOpen || prefersReducedMotion || projects.length === 0;
  const {
    activeId: viewportActiveProjectId,
    registerItem,
    scrollMeasurementVersion,
  } = useViewportActivationGroup({
    enabled: true,
    disabled: isViewportPreviewDisabled,
  });

  useEffect(() => {
    isInteractionPreviewActiveRef.current = isInteractionPreviewActive;
  }, [isInteractionPreviewActive]);

  useEffect(() => {
    const previousViewportPreviewId = viewportPreviewIdRef.current;

    if (isViewportPreviewDisabled) {
      if (previousViewportPreviewId !== null) {
        clearPreview?.(previousViewportPreviewId, 'viewport');
        viewportPreviewIdRef.current = null;
      }

      return;
    }

    if (scrollMeasurementVersion === 0 || isInteractionPreviewActiveRef.current) return;

    if (viewportActiveProjectId === null) {
      if (previousViewportPreviewId !== null) {
        clearPreview?.(previousViewportPreviewId, 'viewport');
        viewportPreviewIdRef.current = null;
      }

      return;
    }

    viewportPreviewIdRef.current = viewportActiveProjectId;
    requestPreview?.(viewportActiveProjectId, 'viewport');
  }, [
    clearPreview,
    isViewportPreviewDisabled,
    requestPreview,
    scrollMeasurementVersion,
    viewportActiveProjectId,
  ]);

  useEffect(() => () => {
    if (viewportPreviewIdRef.current !== null) {
      clearPreview?.(viewportPreviewIdRef.current, 'viewport');
    }
  }, [clearPreview]);

  return {
    registerItem,
  };
}

export default useProjectViewportPreview;
