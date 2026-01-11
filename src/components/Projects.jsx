import { useCallback, useEffect, useRef, useState } from 'react';

import projectWorkLogo from '../assets/Project_Work.png'; // placeholder image

import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { fetchProjectsPublic, fetchProjectByIdPublic } from '../api/publicProjects';

// -----------------------
// routing helpers
// -----------------------
const PROJECT_PATH_RE = /^\/p\/([^/]+)\/?$/i;

function parseProjectPath(pathname) {
  const m = pathname.match(PROJECT_PATH_RE);
  if (!m) return null;

  const permalink = decodeURIComponent(m[1] || '').trim();
  if (!permalink) return null;

  const idStr = permalink.split('-')[0];
  const id = Number(idStr);
  if (!Number.isFinite(id)) return null;

  return { id, permalink };
}

function buildProjectPath(permalinkOrId) {
  const seg = String(permalinkOrId ?? '').trim();
  return `/p/${encodeURIComponent(seg)}`;
}

// -----------------------
// VM (View Model) normalization
// -----------------------
function normalizeUrl(raw) {
  if (raw === null || raw === undefined) return undefined;
  const s = String(raw).trim();
  if (!s || s.toUpperCase() === 'NULL') return undefined;
  return s;
}

function normalizeStringArray(raw, fallback = []) {
  if (!Array.isArray(raw)) return fallback;
  return raw
    .map((x) => (x ?? '').toString().trim())
    .filter(Boolean);
}

function normalizeArray(raw, fallback = []) {
  return Array.isArray(raw) ? raw : fallback;
}

/**
 * Card View Model: apiRow (project), data for ProjectCard.
 */
function toCardVM(apiRow, idx) {
  const id = apiRow?.id ?? idx;

  const permalink = (apiRow.permalink ?? '').toString().trim();

  const imageUrl = normalizeUrl(apiRow.imageUrl) || projectWorkLogo;
  const videoUrl = normalizeUrl(apiRow.videoUrl) ?? null;
  const title = apiRow.title || null;
  const description = apiRow.description || null;
  const directUrl = normalizeUrl(apiRow.directUrl) || null;
  const techTags = normalizeStringArray(apiRow.techTags, []);

  // Modal-safe defaults
  return {
    id,
    permalink,

    imageUrl,
    videoUrl,

    title,
    description,

    directUrl,
    techTags,

    // details-only fields (safe defaults while loading)
    overview: null,
    role: null,
    techStack: null,

    architectureImageUrl: null,

    features: [],
    metrics: null,
    challenges: [],
    improvements: [],
  };
}

/**
 * Details View Model: raw (project), data for ProjectModal.
 */
function toDetailsVM(raw) {
  if (!raw) return null;

  const out = {};

  if (raw.id !== undefined) out.id = raw.id;
  if (raw.permalink !== undefined) out.permalink = String(raw.permalink || '').trim();
  if (raw.title !== undefined) out.title = raw.title;

  const image = normalizeUrl(raw.imageUrl);
  if (image !== undefined) out.imageUrl = image;

  const video = normalizeUrl(raw.videoUrl);
  if (video !== undefined) out.videoUrl = video;

  if (raw.liveUrl !== undefined) out.liveUrl = raw.liveUrl;
  if (raw.sourceUrl !== undefined) out.sourceUrl = raw.sourceUrl;
  if (raw.writeupUrl !== undefined) out.writeupUrl = raw.writeupUrl;
  if (raw.videoPageUrl !== undefined) out.videoPageUrl = raw.videoPageUrl;

  if (raw.overview !== undefined) out.overview = raw.overview ?? '';
  if (raw.role !== undefined) out.role = raw.role ?? '';

  if (raw.techStack !== undefined) out.techStack = raw.techStack;

  const arch = normalizeUrl(raw.architectureImageUrl);
  if (arch !== undefined) out.architectureImageUrl = arch ?? '';

  if (raw.features !== undefined) out.features = normalizeArray(raw.features, []);
  if (raw.metrics !== undefined) out.metrics = normalizeArray(raw.metrics, null);
  if (raw.challenges !== undefined) out.challenges = normalizeArray(raw.challenges, []);
  if (raw.improvements !== undefined) out.improvements = normalizeArray(raw.improvements, []);

  return out;
}

function mergeProjectVM(cardVM, detailsVM) {
  const c = cardVM || {};
  const d = detailsVM || {};

  const merged = { ...d };

  if (d.permalink == null || d.permalink === '') merged.permalink = c.permalink;
  if (d.title == null || d.title === '') merged.title = c.title;

  if (d.imageUrl == null || d.imageUrl === '') merged.imageUrl = c.imageUrl;
  if (d.videoUrl == null || d.videoUrl === '') merged.videoUrl = c.videoUrl;

  return merged;
}

function Projects() {
  const [projects, setProjects] = useState([]); 
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const openedViaPushRef = useRef(false);
  const detailsCacheRef = useRef(new Map());
  const openSeqRef = useRef(0);
  const projectsRef = useRef(projects);
  const activeProjectIdRef = useRef(null);

  const isModalOpen = activeProjectId != null;

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { activeProjectIdRef.current = activeProjectId; }, [activeProjectId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchProjectsPublic();
        if (!isMounted || !data) return;

        const rows = Array.isArray(data.projects) ? data.projects : [];
        const mapped = rows.map((p, idx) => toCardVM(p, idx));
        setProjects(mapped);
      } catch (err) {
        console.error('[Projects] Failed to load public projects:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    })();

    return () => { isMounted = false; };
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
      detailsVM = raw ? toDetailsVM(raw) : null;
      if (detailsVM) detailsCacheRef.current.set(id, detailsVM);
    }

    // Race Gaurds (eg. 2 modals opened back to back)
    if (seq !== openSeqRef.current) return;
    if (activeProjectIdRef.current !== id) return;

    // Hydrate modal with details
    if (detailsVM) {
      setActiveProject((prev) => mergeProjectVM(prev, detailsVM));

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

    setActiveProject((prev) => (prev ? mergeProjectVM(card, prev) : card));
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
            image={p.imageUrl}
            video={p.videoUrl}
            title={p.title}
            desc={p.description}
            link={p.directUrl}
            tags={p.techTags}
            onOpenModal={() => openFromCard(p)}
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
