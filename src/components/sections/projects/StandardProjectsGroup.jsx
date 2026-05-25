import ProjectCard from '../../projects/ProjectCard';
import LogoLoop from '../../ui/LogoLoop';
import SectionTitle from '../../ui/SectionTitle';
import Text from '../../ui/Text';
import useMediaQuery from '../../../hooks/useMediaQuery';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import useProjectViewportPreview from '../../../hooks/useProjectViewportPreview';

const NON_MOBILE_QUERY = '(min-width: 768px)';

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

      <div className={shouldRenderLoop ? 'w-full' : 'grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}>
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
            speed={80}
            gap={24}
            pauseOnHover
            renderItem={(project, key, isDuplicate) => renderProjectCard(project, key, isDuplicate)}
            ariaLabel="Standard project cards"
          />
        ) : projects.map((p) => renderProjectCard(p, p.id))}
      </div>
    </section>
  );
}

export default StandardProjectsGroup;
