import { useCallback, useEffect, useRef, useState } from 'react';

import projectWorkLogo from '../../assets/Project_Work.png'; // placeholder image

import ProjectCard from '../projects/ProjectCard';
import ProjectModal from '../projects/modal/ProjectModal';
import { fetchProjectsPublic, fetchProjectByIdPublic } from '../../api/public/projects';
import {
  mergeProjectViewModels,
  toProjectCardViewModel,
  toProjectDetailsViewModel,
} from '../../domain/projects/mappers';
import { buildProjectPath, parseProjectPath } from '../../domain/projects/routing';



/**
 * Projects component.
 */
function Projects() {
  const [projects, setProjects] = useState([]); 
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Modals
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Hover Previews
  const [activePreviewId, setActivePreviewId] = useState(null);

  const openedViaPushRef = useRef(false);
  const detailsCacheRef = useRef(new Map());
  const openSeqRef = useRef(0);
  const projectsRef = useRef(projects);
  const activeProjectIdRef = useRef(null);
  const lastInputRef = useRef('pointer'); // 'pointer' | 'keyboard'

  const isModalOpen = activeProjectId != null;

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { activeProjectIdRef.current = activeProjectId; }, [activeProjectId]);

  useEffect(() => {
      const onPointerDown = () => { lastInputRef.current = 'pointer'; };
      const onKeyDown = (e) => {
          // Often only treat Tab/Arrow keys as "navigation"
          if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
              lastInputRef.current = 'keyboard';
          }
      };

      window.addEventListener('pointerdown', onPointerDown, true); 
      window.addEventListener('keydown', onKeyDown, true);

      return () => {
          window.removeEventListener('pointerdown', onPointerDown, true);
          window.removeEventListener('keydown', onKeyDown, true);
      };
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchProjectsPublic();
        if (!isMounted || !data) return;

        const rows = Array.isArray(data.projects) ? data.projects : [];
        const mapped = rows.map((p, idx) => toProjectCardViewModel(p, {
          fallbackId: idx,
          fallbackImageUrl: projectWorkLogo,
        }));
        setProjects(mapped);
      } catch (err) {
        console.error('[Projects] Failed to load public projects:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  const requestPreview = useCallback((id) => {
    setActivePreviewId((prev) => (prev === id ? prev : id));
  }, []);

  const clearPreview = useCallback((id) => {
    setActivePreviewId((prev) => (prev === id ? null : prev));
  }, []);

  const openProjectById = useCallback(async (id, cardFallback = null) => {
    const seq = ++openSeqRef.current;

    activeProjectIdRef.current = id
    setActiveProjectId(id);

    // instant load modal with card (from card click) or loading (deep link)
    const seed = cardFallback ?? { id, title: 'Loading…' };
    setActiveProject(seed);

    // Try cache for details before refetching
    let detailsVM = detailsCacheRef.current.get(id);
    if (!detailsVM) {
      const raw = await fetchProjectByIdPublic(id);
      detailsVM = raw ? toProjectDetailsViewModel(raw) : null;
      if (detailsVM) detailsCacheRef.current.set(id, detailsVM);
    }

    // Race Gaurds (eg. 2 modals opened back to back)
    if (seq !== openSeqRef.current) return;
    if (activeProjectIdRef.current !== id) return;

    // Hydrate modal with details
    if (detailsVM) {
      setActiveProject((prev) => mergeProjectViewModels(prev, detailsVM));

      // Canonicalize the URL
      if (detailsVM.permalink) {
        const canonical = buildProjectPath(detailsVM.permalink);
        if (window.location.pathname !== canonical) {
          history.replaceState(history.state, '', canonical);
        }
      }
    }
  }, []);

  // Deep Link Modal Router.
  // Takes the current browser URL and ensures React modal state matches it.
  const syncRouteToModal = useCallback(() => {
    const parsed = parseProjectPath(window.location.pathname);

    // Not project URL, close modal
    if (!parsed?.id) {
      activeProjectIdRef.current = null;
      setActiveProjectId(null);
      setActiveProject(null);
      return;
    }

    // Not opened from card
    openedViaPushRef.current = false;

    openProjectById(parsed.id);
  }, [openProjectById]);

  useEffect(() => {
    const onPop = () => syncRouteToModal();
    window.addEventListener('popstate', onPop);
    syncRouteToModal();
    return () => window.removeEventListener('popstate', onPop);
  }, [syncRouteToModal]);

  useEffect(() => {
    const id = Number(activeProjectIdRef.current);
    if (!Number.isFinite(id)) return;

    const card = projects.find((p) => Number(p.id) === id) || null;
    if (!card) return;

    setActiveProject((prev) => (prev ? mergeProjectViewModels(card, prev) : card));
  }, [projects]);

  function openFromCard(card) {
    const id = Number(card.id);
    if (!Number.isFinite(id)) return;

    openedViaPushRef.current = true;
    const path = buildProjectPath(card.permalink || id);
    history.pushState({ modal: true, projectId: id, permalink: card.permalink || '' }, '', path);

    openProjectById(id, card);
  }

  function closeModal() {
    if (activeProjectId == null) return;

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false;
      history.back();
      return;
    }

    history.replaceState({}, '', '/');
    setActiveProjectId(null);
    setActiveProject(null);
  }

  return (
    <div
      id="Projects"
      className="
        w-full min-h-fit scroll-mt-10 
        flex flex-col justify-center
      "
    >
      <div className='text-4xl font-bold text-emerald-50 mb-8' data-aos="flip-down">
        <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">Project Showcase</span>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {isLoadingProjects && projects.length === 0 && (
          <div className="col-span-full text-emerald-50/60 text-sm">
            Loading projects…
          </div>
        )}

        {!isLoadingProjects && projects.length === 0 && (
          <div className="col-span-full text-emerald-50/60 text-sm">
            No projects published yet.
          </div>
        )}

        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            id={p.id}
            isActivePreview={Number(activePreviewId) === Number(p.id)}
            requestPreview={requestPreview}
            clearPreview={clearPreview}
            lastInputRef={lastInputRef}
            image={p.imageUrl}
            video={p.videoUrl}
            title={p.title}
            desc={p.description}
            link={p.directUrl}
            tags={p.techTags}
            onOpenModal={() => openFromCard(p)}
            isModalOpen={isModalOpen}
          />
        ))}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        project={activeProject}
        onClose={closeModal}
      />
    </div>
  );
}

export default Projects;
