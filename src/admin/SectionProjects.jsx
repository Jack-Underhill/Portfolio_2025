import { useState, useEffect } from 'react';

import RowProject from './RowProject';
import InputTextArea from './InputTextArea';
import CardNav from './CardNav';


function createEmptyProject() {
    return {
        id: crypto.randomUUID(),

        // media
        imageFile: null,
        imageUrl: '',
        architectureImageFile: null,
        architectureImageUrl: '',
        videoFile: null,
        videoUrl: '',

        // card fields
        title: '',
        description: '',
        techTags: [''],
        url: '',

        // modal fields
        permalink: '',
        overview: '',
        role: '',
        sourceUrl: '',
        writeupUrl: '',
        videoPageUrl: '',

        // tech for modal + derived tags for card marquee
        techStack: {
            frontend: [''],
            backend: [''],
            data: [''],
            infrastructure: [''],
        },

        // modal lists
        features: [''],
        metrics: [''],
        challenges: [],
        improvements: [''],

        // control/meta
        published: true,
        sortOrder: 0,
    };
}

function SectionProjects({ state, onChange }) {
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

    const normalizeSortOrder = (arr) => arr.map((p, i) => ({ ...p, sortOrder: i }));

    const setProjects = (updater) => {
        const nextRaw = typeof updater === 'function' ? updater(projects) : updater;
        const next = normalizeSortOrder(nextRaw);
        updateState({ projects: next });
    };

    // --- add / update / remove ---
    const handleAddProject = () => {
        setProjects((prev) => [...prev, createEmptyProject()]);
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

            <InputTextArea
                id="project-bio"
                label="Projects intro / bio"
                value={projectBio}
                onChange={setProjectBio}
            />

            <CardNav
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
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                >
                    + Add Project
                </button>
            </div>

            {activeProject && (
                <RowProject
                    project={activeProject}
                    onChange={(updated) => handleChangeProject(activeProject.id, updated)}
                    onRemove={() => handleRemoveProject(activeProject.id)}
                />
            )}
        </div>
    );
}

export default SectionProjects;
