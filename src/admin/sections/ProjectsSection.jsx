import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import ProjectModal from '../../components/projects/modal/ProjectModal';

import ProjectEditor from '../projects/ProjectEditor';
import ProjectPreviewActions from '../projects/ProjectPreviewActions';
import TextAreaInput from '../forms/TextAreaInput';
import CardSelector from '../navigation/CardSelector';

import { validateProjectDraft } from '../api/adminClient';
import { createEmptyProjectDraft } from '../../domain/projects/defaults';
import { normalizeProjectSortOrder } from '../../domain/projects/mappers';
import { mapProjectDraftToPreviewProject } from '../../domain/projects/preview';
import { adminUi } from '../../styles/recipes';


function ProjectsSection({ state, onChange }) {
    const { projectBio, projects } = state;
    const [activeId, setActiveId] = useState(projects[0]?.id ?? null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewMediaUrls, setPreviewMediaUrls] = useState({});
    const [validationState, setValidationState] = useState(null);
    const validationRequestId = useRef(0);

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
    const clearValidationState = useCallback(() => {
        validationRequestId.current += 1;
        setValidationState(null);
    }, []);

    const updateState = (patch) => {
        clearValidationState();
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

    const handleValidateDraft = useCallback(async () => {
        const requestId = validationRequestId.current + 1;
        validationRequestId.current = requestId;
        setValidationState({
            state: 'validating',
            type: 'status',
            message: 'Validating draft...',
        });

        try {
            const result = await validateProjectDraft(state);
            if (validationRequestId.current !== requestId) return;

            const count = result?.projectCount ?? projects.length;
            setValidationState({
                state: 'success',
                type: 'status',
                message:
                    count === 1
                        ? 'Draft validation passed for the project.'
                        : `Draft validation passed for all ${count} projects.`,
            });
        } catch (error) {
            if (validationRequestId.current !== requestId) return;

            setValidationState({
                state: 'error',
                type: 'alert',
                message: error?.message || 'Draft validation failed',
            });
        }
    }, [projects.length, state]);

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
                        canValidate={projects.length > 0}
                        isValidating={validationState?.state === 'validating'}
                        onPreview={handleOpenPreview}
                        onValidate={handleValidateDraft}
                    />

                    {validationState && (
                        <p
                            className={
                                validationState.type === 'alert'
                                    ? 'text-sm text-admin-danger-hover'
                                    : 'text-sm text-admin-accent-text'
                            }
                            role={validationState.type}
                        >
                            {validationState.message}
                        </p>
                    )}

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
