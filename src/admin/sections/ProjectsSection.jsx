import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import ProjectModal from '../../components/projects/modal/ProjectModal';

import ProjectEditor from '../projects/ProjectEditor';
import ProjectWorkspaceActions from '../projects/ProjectWorkspaceActions';
import {
    getProjectFieldWorkflowLocationIds,
    getProjectWorkflowLocationId,
    PROJECTS_WORKFLOW_LOCATION_ID,
} from '../projects/projectEditorSections';
import CardSelector from '../navigation/CardSelector';
import AdminSectionToolbar from '../shell/AdminSectionToolbar';

import { runProjectAgent, validateProjectDraft } from '../api/adminClient';
import {
    applyAgentProjectDraftPatch,
    createAgentProjectDraftReviewContext,
    stringifyAgentProjectDraftReviewContext,
} from '../../domain/projects/agentDraft';
import { createEmptyProjectDraft } from '../../domain/projects/defaults';
import { normalizeProjectSortOrder } from '../../domain/projects/mappers';
import { mapProjectDraftToPreviewProject } from '../../domain/projects/preview';

const PROJECT_DRAFT_IMPORT_PANEL_ID = 'project-agent-draft-import-panel';
const PROJECT_DRAFT_CONTEXT_PANEL_ID = 'project-agent-draft-context-panel';

function createIdleAgentRunState() {
    return {
        status: 'idle',
        error: '',
        notes: [],
        warnings: [],
        appliedFields: [],
        changedFields: [],
        elapsedMs: null,
    };
}

function ProjectsSection({
    state,
    onChange,
    isSaveInFlight = false,
    onValidationBusyChange,
    onValidationStart,
    onValidationSuccess,
    onValidationFailure,
    onProjectSectionMount,
    onProjectRecordChangeStart,
    onProjectWorkspaceReturn,
}) {
    const { projects } = state;
    const [activeId, setActiveId] = useState(projects[0]?.id ?? null);
    const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);
    const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewMediaUrls, setPreviewMediaUrls] = useState({});
    const [validationState, setValidationState] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [agentRunState, setAgentRunState] = useState(createIdleAgentRunState);
    const [lastAgentRunRequest, setLastAgentRunRequest] = useState(null);
    const stateRef = useRef(state);
    const activeProjectRef = useRef(null);
    const isMountedRef = useRef(false);
    const validationRequestId = useRef(0);
    const agentRunRequestId = useRef(0);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

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
    const lastActiveProjectId = useRef(activeProject?.id ?? null);
    stateRef.current = state;
    activeProjectRef.current = activeProject;

    useEffect(() => {
        const currentProjectId = activeProject?.id ?? null;
        if (lastActiveProjectId.current === currentProjectId) return;

        lastActiveProjectId.current = currentProjectId;
        agentRunRequestId.current += 1;
        setAgentRunState(createIdleAgentRunState);
        setLastAgentRunRequest(null);
    }, [activeProject?.id]);

    const previewProject = useMemo(() => {
        if (!activeProject) return null;
        return {
            ...mapProjectDraftToPreviewProject(activeProject),
            ...previewMediaUrls,
        };
    }, [activeProject, previewMediaUrls]);
    const currentProjectContextText = useMemo(() => {
        if (!activeProject) return '';
        return stringifyAgentProjectDraftReviewContext(activeProject);
    }, [activeProject]);

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

    const updateState = (patch, ownerLocationIds) => {
        clearValidationState();
        onChange({ ...stateRef.current, ...patch }, ownerLocationIds);
    };

    const setProjects = (updater, ownerLocationIds) => {
        const currentProjects = stateRef.current.projects ?? [];
        const nextRaw = typeof updater === 'function' ? updater(currentProjects) : updater;
        const next = normalizeProjectSortOrder(nextRaw);
        updateState({ projects: next }, ownerLocationIds);
    };

    const handleOpenPreview = useCallback(() => {
        setIsPreviewOpen(true);
    }, []);

    const handleToggleImportPanel = useCallback(() => {
        setIsImportPanelOpen((isOpen) => !isOpen);
    }, []);

    const handleToggleContextPanel = useCallback(() => {
        setIsContextPanelOpen((isOpen) => !isOpen);
    }, []);

    const handleContextCopied = useCallback(() => {
        setIsContextPanelOpen(false);
        onProjectWorkspaceReturn?.();
    }, [onProjectWorkspaceReturn]);

    const handleAgentDraftApplied = useCallback(() => {
        setIsImportPanelOpen(false);
        onProjectWorkspaceReturn?.();
    }, [onProjectWorkspaceReturn]);

    const handleSelectProject = useCallback((projectId) => {
        if (projectId === resolvedActiveId) return;

        onProjectRecordChangeStart?.();
        activeProjectRef.current = projects.find((project) => project.id === projectId) ?? null;
        agentRunRequestId.current += 1;
        setAgentRunState(createIdleAgentRunState);
        setLastAgentRunRequest(null);
        setActiveId(projectId);
    }, [onProjectRecordChangeStart, projects, resolvedActiveId]);

    const handleClosePreview = useCallback(() => {
        setIsPreviewOpen(false);
    }, []);

    const handleValidateDraft = useCallback(async () => {
        if (isValidating || isSaveInFlight) return;

        const requestId = validationRequestId.current + 1;
        validationRequestId.current = requestId;
        setIsValidating(true);
        onValidationBusyChange?.(true);
        onValidationStart?.();
        setValidationState({
            state: 'validating',
            type: 'status',
            message: 'Validating draft...',
        });

        try {
            const result = await validateProjectDraft(state);
            if (validationRequestId.current !== requestId) return;

            if (isMountedRef.current) {
                const count = result?.projectCount ?? projects.length;
                onValidationSuccess?.();
                setValidationState({
                    state: 'success',
                    type: 'status',
                    message:
                        count === 1
                            ? 'Draft validation passed for the project.'
                            : `Draft validation passed for all ${count} projects.`,
                });
            }
        } catch (error) {
            if (validationRequestId.current !== requestId) return;

            if (isMountedRef.current) {
                onValidationFailure?.();
                setValidationState({
                    state: 'error',
                    type: 'alert',
                    message: error?.message || 'Draft validation failed',
                });
            }
        } finally {
            onValidationBusyChange?.(false);
            if (isMountedRef.current) {
                setIsValidating(false);
            }
        }
    }, [
        isSaveInFlight,
        isValidating,
        onValidationBusyChange,
        onValidationFailure,
        onValidationStart,
        onValidationSuccess,
        projects.length,
        state,
    ]);

    // --- add / update / remove ---
    const handleAddProject = () => {
        setProjects((prev) => [
            ...prev,
            createEmptyProjectDraft({ id: crypto.randomUUID(), sortOrder: prev.length }),
        ], [PROJECTS_WORKFLOW_LOCATION_ID]);
    };

    const handleReorderProjects = (fromIndex, toIndex) => {
        setProjects((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        }, [PROJECTS_WORKFLOW_LOCATION_ID]);
    };

    const handleChangeProject = (id, updatedProject, ownerLocationIds) => {
        setProjects(
            (prev) => prev.map((p) => (p.id === id ? updatedProject : p)),
            ownerLocationIds,
        );
    };

    const handleProjectSectionChange = (sectionId, updatedProject) => {
        handleChangeProject(
            activeProject.id,
            updatedProject,
            [getProjectWorkflowLocationId(sectionId)],
        );
    };

    const applyAgentDraftToProject = (project, payload) => {
        const result = applyAgentProjectDraftPatch(project, payload);
        const ownerLocationIds = getProjectFieldWorkflowLocationIds(result.changedFields);
        if (ownerLocationIds.length > 0) {
            handleChangeProject(project.id, result.project, ownerLocationIds);
        }
        return result;
    };

    const handleApplyAgentDraft = (payloadText) => {
        if (!activeProject) return {
            project: null,
            patch: {},
            appliedFields: [],
            changedFields: [],
            warnings: ['No active project is selected.'],
        };

        return applyAgentDraftToProject(activeProject, payloadText);
    };

    const handleRunProjectAgent = async ({ mode, instructions }) => {
        if (!activeProject || isSaveInFlight || agentRunState.status === 'running') return;

        const runProjectId = activeProject.id;
        const requestId = agentRunRequestId.current + 1;
        const projectContext = createAgentProjectDraftReviewContext(activeProject);
        agentRunRequestId.current = requestId;
        setLastAgentRunRequest({ mode, instructions });
        setAgentRunState({
            status: 'running',
            error: '',
            notes: [],
            warnings: [],
            appliedFields: [],
            changedFields: [],
            elapsedMs: null,
        });

        try {
            const result = await runProjectAgent({
                mode,
                instructions,
                projectContext,
            });
            if (!isMountedRef.current) return;
            if (agentRunRequestId.current !== requestId) return;

            const latestProject = activeProjectRef.current;
            if (!latestProject || latestProject.id !== runProjectId) {
                return;
            }

            const applyResult = applyAgentDraftToProject(latestProject, result.patch);
            setAgentRunState({
                status: 'succeeded',
                error: '',
                notes: result.notes ?? [],
                warnings: [...(result.warnings ?? []), ...applyResult.warnings],
                appliedFields: applyResult.appliedFields,
                changedFields: applyResult.changedFields,
                elapsedMs: result.elapsedMs ?? null,
            });
        } catch (error) {
            if (!isMountedRef.current) return;
            if (agentRunRequestId.current !== requestId) return;

            const latestProject = activeProjectRef.current;
            if (!latestProject || latestProject.id !== runProjectId) return;

            setAgentRunState({
                status: 'failed',
                error: error?.message || 'Project agent run failed.',
                notes: [],
                warnings: [],
                appliedFields: [],
                changedFields: [],
                elapsedMs: null,
            });
        }
    };

    const handleClearAgentRunResult = () => {
        if (agentRunState.status === 'running') return;

        setAgentRunState(createIdleAgentRunState);
    };

    const handleRetryProjectAgent = () => {
        if (!lastAgentRunRequest) return;
        if (!activeProject || isSaveInFlight || agentRunState.status === 'running') return;

        handleRunProjectAgent(lastAgentRunRequest);
    };

    const handleRemoveProject = (id) => {
        if (activeProjectRef.current?.id === id) {
            activeProjectRef.current = null;
        }
        agentRunRequestId.current += 1;
        setAgentRunState(createIdleAgentRunState);
        setLastAgentRunRequest(null);
        setProjects(
            (prev) => prev.filter((p) => p.id !== id),
            [PROJECTS_WORKFLOW_LOCATION_ID],
        );
        setIsPreviewOpen(false);
    };

    return (
        <div className="space-y-4">
            <AdminSectionToolbar>
                <CardSelector
                    cardTypeId="Project"
                    cards={projects}
                    activeId={activeId}
                    onSelect={handleSelectProject}
                    onReorder={handleReorderProjects}
                />
            </AdminSectionToolbar>

            <ProjectWorkspaceActions
                canPreview={Boolean(previewProject)}
                canValidate={projects.length > 0}
                isSaveInFlight={isSaveInFlight}
                isValidating={isValidating}
                onAddProject={handleAddProject}
                onPreview={handleOpenPreview}
                onValidate={handleValidateDraft}
            />

            {activeProject && (
                <>
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
                        agentDraft={{
                            agentRun: agentRunState,
                            contextPanelId: PROJECT_DRAFT_CONTEXT_PANEL_ID,
                            contextText: currentProjectContextText,
                            importPanelId: PROJECT_DRAFT_IMPORT_PANEL_ID,
                            isContextOpen: isContextPanelOpen,
                            isImportOpen: isImportPanelOpen,
                            isSaveInFlight,
                            canClearResult: agentRunState.status !== 'idle'
                                && agentRunState.status !== 'running',
                            canRetry: Boolean(lastAgentRunRequest)
                                && Boolean(activeProject)
                                && !isSaveInFlight
                                && agentRunState.status !== 'running',
                            onApplyDraft: handleApplyAgentDraft,
                            onApplySuccess: handleAgentDraftApplied,
                            onClearResult: handleClearAgentRunResult,
                            onCopySuccess: handleContextCopied,
                            onRunAgent: handleRunProjectAgent,
                            onRetryAgent: handleRetryProjectAgent,
                            onToggleContext: handleToggleContextPanel,
                            onToggleImport: handleToggleImportPanel,
                        }}
                        onSectionChange={handleProjectSectionChange}
                        onRemove={() => handleRemoveProject(activeProject.id)}
                        onSectionMount={onProjectSectionMount}
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
