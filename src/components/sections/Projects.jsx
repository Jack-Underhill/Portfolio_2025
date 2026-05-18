import { useCallback, useEffect, useRef, useState } from 'react';

import projectWorkLogo from '../../assets/Project_Work.png'; // card fallback image

import ProjectCard from '../projects/ProjectCard';
import ProjectModal from '../projects/modal/ProjectModal';
import SectionTitle from '../ui/SectionTitle';
import Text from '../ui/Text';
import { fetchProjectsPublic } from '../../api/public/projects';
import { toProjectCardViewModel } from '../../domain/projects/mappers';
import { groupProjectsForDisplay } from '../../domain/projects/viewModel';
import useProjectModalRouting from '../../hooks/useProjectModalRouting';
import usePublicResource from '../../hooks/usePublicResource';

function mergeProjectCards(data, previous) {
  const rows = Array.isArray(data.projects) ? data.projects : [];
  if (!rows.length) return previous;

  const cards = rows.map((project, index) => toProjectCardViewModel(project, {
    fallbackId: index,
    fallbackImageUrl: projectWorkLogo,
  }));
  const { featuredProjects, standardProjects } = groupProjectsForDisplay(cards);

  return [...featuredProjects, ...standardProjects];
}

/**
 * Projects component.
 */
function Projects() {
  const { data: projects, isLoading: isLoadingProjects } = usePublicResource({
    load: fetchProjectsPublic,
    initialData: [],
    merge: mergeProjectCards,
    label: 'Projects',
  });

  // Hover Previews
  const [activePreviewId, setActivePreviewId] = useState(null);
  const lastInputRef = useRef('pointer'); // 'pointer' | 'keyboard'
  const {
    activeProject,
    isModalOpen,
    openFromCard,
    closeModal,
  } = useProjectModalRouting({ projects });

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

  const requestPreview = useCallback((id) => {
    setActivePreviewId((prev) => (prev === id ? prev : id));
  }, []);

  const clearPreview = useCallback((id) => {
    setActivePreviewId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <div
      id="Projects"
      className="
        w-full min-h-fit scroll-mt-10
        flex flex-col justify-center
      "
    >
      <SectionTitle className="mb-8" data-aos="flip-down">
        Project Showcase
      </SectionTitle>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {isLoadingProjects && projects.length === 0 && (
          <Text as="div" variant="meta" className="col-span-full">
            Loading projects…
          </Text>
        )}

        {!isLoadingProjects && projects.length === 0 && (
          <Text as="div" variant="meta" className="col-span-full">
            No projects published yet.
          </Text>
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
