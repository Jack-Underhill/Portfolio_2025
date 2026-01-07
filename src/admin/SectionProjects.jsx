import { useState } from 'react';
import RowProject from './RowProject';
import InputTextArea from './InputTextArea';

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

    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const SCROLL_MARGIN = 80;
    const SCROLL_SPEED = 12;

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

    const handleChangeProject = (id, updatedProject) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? updatedProject : p))
        );
    };

    const handleRemoveProject = (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    // --- drag logic ---
    const handleDragStart = (index) => (e) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index) => (e) => {
        e.preventDefault();
        if (index !== dragIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();

        const { clientY } = e;
        const { innerHeight } = window;

        if (clientY < SCROLL_MARGIN) {
            window.scrollBy(0, -SCROLL_SPEED);
        } else if (clientY > innerHeight - SCROLL_MARGIN) {
            window.scrollBy(0, SCROLL_SPEED);
        }
    };

    const handleDrop = (index) => (e) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        setProjects((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            return next;
        });

        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
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

            <div className="space-y-4">
                {projects.map((project, index) => {
                    const isDragging = dragIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                        <div
                            key={project.id}
                            className={[
                                'rounded-lg',
                                isDragOver ? 'ring-1 ring-sky-500 bg-slate-900/70' : '',
                                isDragging ? 'opacity-70' : '',
                            ].join(' ')}
                            draggable
                            onDragStart={handleDragStart(index)}
                            onDragEnter={handleDragEnter(index)}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop(index)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
                                <span className="cursor-grab select-none">☰ Drag to reorder</span>
                                <span>#{index + 1}</span>
                            </div>

                            <RowProject
                                project={project}
                                onChange={(updated) => handleChangeProject(project.id, updated)}
                                onRemove={() => handleRemoveProject(project.id)}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleAddProject}
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                >
                    + Add Project
                </button>
            </div>
        </div>
    );
}

export default SectionProjects;
