import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchProjectByIdPublic } from '../api/public/projects';
import {
  mergeProjectViewModels,
  toProjectDetailsViewModel,
} from '../domain/projects/mappers';
import { buildProjectPath, parseProjectPath } from '../domain/projects/routing';

function useProjectModalRouting({ projects = [] } = {}) {
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const openedViaPushRef = useRef(false);
  const detailsCacheRef = useRef(new Map());
  const openSeqRef = useRef(0);
  const activeProjectIdRef = useRef(null);

  const isModalOpen = activeProjectId != null;

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  const openProjectById = useCallback(async (id, cardFallback = null) => {
    const seq = ++openSeqRef.current;

    activeProjectIdRef.current = id;
    setActiveProjectId(id);

    // Seed the modal with card data for clicks, or a loading title for deep links.
    const seed = cardFallback ?? { id, title: 'Loading…' };
    setActiveProject(seed);

    let detailsVM = detailsCacheRef.current.get(id);
    if (!detailsVM) {
      const raw = await fetchProjectByIdPublic(id);
      detailsVM = raw ? toProjectDetailsViewModel(raw) : null;
      if (detailsVM) detailsCacheRef.current.set(id, detailsVM);
    }

    // Race guards for quick back-to-back modal opens.
    if (seq !== openSeqRef.current) return;
    if (activeProjectIdRef.current !== id) return;

    if (detailsVM) {
      setActiveProject((prev) => mergeProjectViewModels(prev, detailsVM));

      if (detailsVM.permalink && typeof window !== 'undefined') {
        const canonical = buildProjectPath(detailsVM.permalink);
        if (window.location.pathname !== canonical) {
          window.history.replaceState(window.history.state, '', canonical);
        }
      }
    }
  }, []);

  const syncRouteToModal = useCallback(() => {
    if (typeof window === 'undefined') return;

    const parsed = parseProjectPath(window.location.pathname);

    if (!parsed?.id) {
      activeProjectIdRef.current = null;
      setActiveProjectId(null);
      setActiveProject(null);
      return;
    }

    openedViaPushRef.current = false;
    openProjectById(parsed.id);
  }, [openProjectById]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPop = () => syncRouteToModal();
    window.addEventListener('popstate', onPop);
    syncRouteToModal();

    return () => window.removeEventListener('popstate', onPop);
  }, [syncRouteToModal]);

  useEffect(() => {
    const id = Number(activeProjectIdRef.current);
    if (!Number.isFinite(id)) return;

    const card = projects.find((project) => Number(project.id) === id) || null;
    if (!card) return;

    setActiveProject((prev) => (prev ? mergeProjectViewModels(card, prev) : card));
  }, [projects]);

  const openFromCard = useCallback((card) => {
    const id = Number(card.id);
    if (!Number.isFinite(id) || typeof window === 'undefined') return;

    openedViaPushRef.current = true;
    const path = buildProjectPath(card.permalink || id);
    window.history.pushState(
      { modal: true, projectId: id, permalink: card.permalink || '' },
      '',
      path,
    );

    openProjectById(id, card);
  }, [openProjectById]);

  const closeModal = useCallback(() => {
    if (activeProjectId == null || typeof window === 'undefined') return;

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false;
      window.history.back();
      return;
    }

    window.history.replaceState({}, '', '/');
    setActiveProjectId(null);
    setActiveProject(null);
  }, [activeProjectId]);

  return {
    activeProject,
    activeProjectId,
    isModalOpen,
    openFromCard,
    closeModal,
  };
}

export default useProjectModalRouting;
