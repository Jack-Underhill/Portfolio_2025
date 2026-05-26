import { useMemo } from 'react';

import ProjectCard from '../../projects/ProjectCard';
import LogoLoop from '../../ui/LogoLoop';
import SectionTitle from '../../ui/SectionTitle';
import Text from '../../ui/Text';

import useMediaQuery from '../../../hooks/useMediaQuery';
import useMeasuredMaxHeight from '../../../hooks/useMeasuredMaxHeight';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import useProjectViewportPreview from '../../../hooks/useProjectViewportPreview';

const NON_MOBILE_QUERY = '(min-width: 768px)';
const MARQUEE_CARD_WIDTH_CLASS = 'w-[clamp(18rem,32vw,26rem)]';

function StandardProjectsGroup({
  projects = [],
  isLoadingProjects,
  activePreviewId,
  requestPreview,
  clearPreview,
  lastInputRef,
  openFromCard,
  isModalOpen,
}) {
  const isNonMobile = useMediaQuery(NON_MOBILE_QUERY);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldRenderLoop = isNonMobile && !prefersReducedMotion && projects.length > 3;
  const measurementKey = useMemo(
    () => projects.map((project) => project.id).join('|'),
    [projects],
  );
  const { maxHeight: marqueeCardHeight, getMeasuredElementRef } = useMeasuredMaxHeight(measurementKey);
  const marqueeCardHeightStyle = marqueeCardHeight > 0 ? { height: `${marqueeCardHeight}px` } : undefined;
  const { registerItem } = useProjectViewportPreview({
    projects,
    isModalOpen,
    lastInputRef,
    requestPreview,
    clearPreview,
  });

  const renderProjectCard = (p, key, isLoopDuplicate = false) => (
    <ProjectCard
      key={key}
      ref={isLoopDuplicate ? undefined : registerItem(p.id)}
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
  );

  return (
    <section
      id="ProjectGallery"
      aria-labelledby="project-gallery-heading"
      className="
        w-full min-h-fit scroll-mt-10
        flex flex-col justify-center
      "
    >
      <SectionTitle id="project-gallery-heading" className="mb-8" data-aos="flip-down">
        Project Gallery
      </SectionTitle>

      <div
        className={
          shouldRenderLoop
            ? 'relative -mx-10 sm:-mx-15 md:-mx-20 lg:-mx-30 xl:-mx-40'
            : 'grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }
      >
        {isLoadingProjects && projects.length === 0 && (
          <Text as="div" variant="meta" className="col-span-full">
            Loading projects...
          </Text>
        )}

        {!isLoadingProjects && projects.length === 0 && (
          <Text as="div" variant="meta" className="col-span-full">
            No projects published yet.
          </Text>
        )}

        {shouldRenderLoop ? (
          <LogoLoop
            logos={projects}
            direction="right"
            speed={120}
            gap={16}
            pauseOnHover
            isPaused={isModalOpen}
            fadeOut
            fadeOutLeftColor="var(--color-page)"
            fadeOutRightColor="#102732"
            renderItem={(project, key, isDuplicate) => (
              <div
                ref={isDuplicate ? undefined : getMeasuredElementRef(project.id)}
                className={`${MARQUEE_CARD_WIDTH_CLASS} my-2`}
                style={marqueeCardHeightStyle}
              >
                {renderProjectCard(project, key, isDuplicate)}
              </div>
            )}
            ariaLabel="Standard project cards"
          />
        ) : projects.map((p) => renderProjectCard(p, p.id))}
      </div>
    </section>
  );
}

export default StandardProjectsGroup;
