import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import projectWorkLogo from '../../assets/Project_Work.png'; // card fallback image

import FeaturedProjectsGroup from './projects/FeaturedProjectsGroup';
import StandardProjectsGroup from './projects/StandardProjectsGroup';
import ProjectModal from '../projects/modal/ProjectModal';
import { fetchProjectsPublic } from '../../api/public/projects';
import { toProjectCardViewModel } from '../../domain/projects/mappers';
import { groupProjectsForDisplay } from '../../domain/projects/viewModel';
import useProjectModalRouting from '../../hooks/useProjectModalRouting';
import usePublicResource from '../../hooks/usePublicResource';

const EMPTY_PROJECT_GROUPS = {
  featuredProjects: [],
  standardProjects: [],
};

function mergeProjectCards(data, previous) {
  const rows = Array.isArray(data.projects) ? data.projects : [];
  if (!rows.length) return previous;

  const cards = rows.map((project, index) => toProjectCardViewModel(project, {
    fallbackId: index,
    fallbackImageUrl: projectWorkLogo,
  }));

  return groupProjectsForDisplay(cards);
}

/**
 * Projects component.
 */
function Projects() {
  const { data: projectGroups, isLoading: isLoadingProjects } = usePublicResource({
    load: fetchProjectsPublic,
    initialData: EMPTY_PROJECT_GROUPS,
    merge: mergeProjectCards,
    label: 'Projects',
  });
  const { featuredProjects, standardProjects } = projectGroups;
  const allProjects = useMemo(
    () => [...featuredProjects, ...standardProjects],
    [featuredProjects, standardProjects],
  );

  // Hover Previews
  const [activePreviewId, setActivePreviewId] = useState(null);
  const lastInputRef = useRef('pointer'); // 'pointer' | 'keyboard'
  const {
    activeProject,
    isModalOpen,
    shouldRestoreFocusOnClose,
    openFromCard,
    closeModal,
  } = useProjectModalRouting({ projects: allProjects });

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
    <>
      <FeaturedProjectsGroup
        projects={featuredProjects}
        isLoadingProjects={isLoadingProjects}
        activePreviewId={activePreviewId}
        requestPreview={requestPreview}
        clearPreview={clearPreview}
        lastInputRef={lastInputRef}
        openFromCard={openFromCard}
        isModalOpen={isModalOpen}
      />

      <StandardProjectsGroup
        projects={standardProjects}
        isLoadingProjects={isLoadingProjects}
        activePreviewId={activePreviewId}
        requestPreview={requestPreview}
        clearPreview={clearPreview}
        lastInputRef={lastInputRef}
        openFromCard={openFromCard}
        isModalOpen={isModalOpen}
      />

      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          project={activeProject}
          onClose={closeModal}
          shouldRestoreFocusOnClose={shouldRestoreFocusOnClose}
        />
      )}
    </>
  );
}

export default Projects;
