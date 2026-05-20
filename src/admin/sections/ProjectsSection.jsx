import { useState, useEffect, useMemo, useCallback } from 'react';

import ProjectModal from '../../components/projects/modal/ProjectModal';

import ProjectEditor from '../projects/ProjectEditor';
import ProjectPreviewActions from '../projects/ProjectPreviewActions';
import TextAreaInput from '../forms/TextAreaInput';
import CardSelector from '../navigation/CardSelector';

import { createEmptyProjectDraft } from '../../domain/projects/defaults';
import { normalizeProjectSortOrder } from '../../domain/projects/mappers';
import { mapProjectDraftToPreviewProject } from '../../domain/projects/preview';
import { adminUi } from '../../styles/recipes';


function ProjectsSection({ state, onChange }) {
    const { projectBio, projects } = state;
    const [activeId, setActiveId] = useState(projects[0]?.id ?? null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewMediaUrls, setPreviewMediaUrls] = useState({});

    // auto-set activeId to first project if none selected
    useEffect(() => {
        if (!projects.length) {
            if (activeId !== null) setActiveId(null);
            return;
        }

        const exists = projects.some((p) => p.id === activeId);
        if (!exists) setActiveId(projects[0].id);
    }, [projects, activeId]);

    const resolvedActiveId = projects.some((p) => p.id === activeId)
        ? activeId
        : (projects[0]?.id ?? null);

    const activeProject = projects.find((p) => p.id === resolvedActiveId) ?? null;
    const previewProject = useMemo(() => {
        if (!activeProject) return null;
        return {
            ...mapProjectDraftToPreviewProject(activeProject),
            ...previewMediaUrls,
        };
    }, [activeProject, previewMediaUrls]);

    useEffect(() => {
        if (!isPreviewOpen || !activeProject) {
            setPreviewMediaUrls({});
            return undefined;
        }

        const urls = {};
        if (activeProject.imageFile) {
            urls.imageUrl = URL.createObjectURL(activeProject.imageFile);
        }
        if (activeProject.videoFile) {
            urls.videoUrl = URL.createObjectURL(activeProject.videoFile);
        }
        if (activeProject.architectureImageFile) {
            urls.architectureImageUrl = URL.createObjectURL(activeProject.architectureImageFile);
        }

        setPreviewMediaUrls(urls);

        return () => {
            Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [
        activeProject,
        activeProject?.architectureImageFile,
        activeProject?.imageFile,
        activeProject?.videoFile,
        isPreviewOpen,
    ]);

    // state handlers
    const updateState = (patch) => {
        onChange({ ...state, ...patch });
    };

    const setProjectBio = (value) => {
        updateState({ projectBio: value });
    };

    const setProjects = (updater) => {
        const nextRaw = typeof updater === 'function' ? updater(projects) : updater;
        const next = normalizeProjectSortOrder(nextRaw);
        updateState({ projects: next });
    };

    const handleOpenPreview = useCallback(() => {
        setIsPreviewOpen(true);
    }, []);

    const handleClosePreview = useCallback(() => {
        setIsPreviewOpen(false);
    }, []);

    // --- add / update / remove ---
    const handleAddProject = () => {
        setProjects((prev) => [
            ...prev,
            createEmptyProjectDraft({ id: crypto.randomUUID(), sortOrder: prev.length }),
        ]);
    };

    const handleReorderProjects = (fromIndex, toIndex) => {
        setProjects((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const handleChangeProject = (id, updatedProject) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? updatedProject : p))
        );
    };

    const handleRemoveProject = (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setIsPreviewOpen(false);
    };

    return (
        <div className="space-y-6">
            <h2 id="admin-projects-heading" className="text-xl font-semibold">Projects Section</h2>

            <TextAreaInput
                id="project-bio"
                label="Projects intro / bio"
                value={projectBio}
                onChange={setProjectBio}
            />

            <CardSelector
                cardTypeId="Project"
                cards={projects}
                activeId={activeId}
                onSelect={setActiveId}
                onReorder={handleReorderProjects}
            />

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleAddProject}
                    aria-label="Add project"
                    className={adminUi.secondaryButton}
                >
                    + Add Project
                </button>
            </div>

            {activeProject && (
                <>
                    <ProjectPreviewActions
                        canPreview={Boolean(previewProject)}
                        onPreview={handleOpenPreview}
                    />

                    <ProjectEditor
                        project={activeProject}
                        onChange={(updated) => handleChangeProject(activeProject.id, updated)}
                        onRemove={() => handleRemoveProject(activeProject.id)}
                    />

                    <ProjectModal
                        isOpen={isPreviewOpen}
                        project={previewProject}
                        onClose={handleClosePreview}
                        isAdminPreview
                    />
                </>
            )}
        </div>
    );
}

export default ProjectsSection;
