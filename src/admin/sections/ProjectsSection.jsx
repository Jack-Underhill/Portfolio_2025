import { useState, useEffect } from 'react';

import ProjectEditor from '../projects/ProjectEditor';
import TextAreaInput from '../forms/TextAreaInput';
import CardSelector from '../navigation/CardSelector';
import { createEmptyProjectDraft } from '../../domain/projects/defaults';
import { normalizeProjectSortOrder } from '../../domain/projects/mappers';
import { adminUi } from '../../styles/recipes';


function ProjectsSection({ state, onChange }) {
    const { projectBio, projects } = state;
    const [activeId, setActiveId] = useState(projects[0]?.id ?? null);

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
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Projects Section</h2>

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
                    className={adminUi.secondaryButton}
                >
                    + Add Project
                </button>
            </div>

            {activeProject && (
                <ProjectEditor
                    project={activeProject}
                    onChange={(updated) => handleChangeProject(activeProject.id, updated)}
                    onRemove={() => handleRemoveProject(activeProject.id)}
                />
            )}
        </div>
    );
}

export default ProjectsSection;
