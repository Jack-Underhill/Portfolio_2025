import ProjectCard from '../../projects/ProjectCard';
import ProjectModal from '../../projects/modal/ProjectModal';
import SectionTitle from '../../ui/SectionTitle';
import Text from '../../ui/Text';

function StandardProjectsGroup({
  projects = [],
  isLoadingProjects,
  activePreviewId,
  requestPreview,
  clearPreview,
  lastInputRef,
  openFromCard,
  isModalOpen,
  activeProject,
  closeModal,
  shouldRenderModal,
}) {
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

      {shouldRenderModal && (
        <ProjectModal
          isOpen={isModalOpen}
          project={activeProject}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

export default StandardProjectsGroup;
