import ProjectCard from '../../projects/ProjectCard';
import SectionTitle from '../../ui/SectionTitle';
import Text from '../../ui/Text';
import useProjectViewportPreview from '../../../hooks/useProjectViewportPreview';

function FeaturedProjectsGroup({
  projects = [],
  isLoadingProjects,
  activePreviewId,
  requestPreview,
  clearPreview,
  lastInputRef,
  openFromCard,
  isModalOpen,
}) {
  const { registerItem } = useProjectViewportPreview({
    projects,
    isModalOpen,
    lastInputRef,
    requestPreview,
    clearPreview,
  });

  return (
    <section
      id="Projects"
      aria-labelledby="featured-work-heading"
      className="
        w-full min-h-fit scroll-mt-10
        flex flex-col justify-center
      "
    >
      <SectionTitle id="featured-work-heading" className="mb-8" data-aos="flip-down">
        Featured Work
      </SectionTitle>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

        {projects.map((p) => (
          <div key={p.id} ref={registerItem(p.id)} className="h-full">
            <ProjectCard
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
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProjectsGroup;
