export const DEFAULT_PROJECT_MODAL = {
    slug: "wsu-das-modernization",
    title: "WSU DAS Modernization",

    // Action buttons (conditionally rendered)
    liveUrl: 'https://decisionaid.systems/',
    sourceUrl: 'https://github.com/wsu-das',
    writeupUrl: 'https://kvxswgdxwrlwbzdkxgsf.supabase.co/storage/v1/object/public/portfolio-assets/docs/resume.pdf',
    videoUrl: 'https://youtu.be/B2fOKqGwaTA',

    // Hero media
    // (Set these to local assets or Supabase/Netlify bucket URLs later)
    video: null,
    image: null,

    overview:
        "A capstone project to modernize WSU’s Decision Aid Systems (DAS) AgNet platform. The goal is to replace legacy Blade/Now-UI pages with a modern React + Inertia front end while keeping the existing Laravel backend stable. I focused on building a clean, scalable UI foundation that can be rolled out page-by-page without breaking production workflows.",

    role:
        "Front-end focused capstone contributor on the modernization effort. Worked on the React + Inertia migration, reusable UI patterns, routing/navigation behavior, and integration with the existing Laravel app. Prioritized incremental rollout, maintainability, and minimizing disruption to a large legacy codebase.",

    tech: {
        frontend: ["React", "Inertia.js", "Vite", "Bootstrap 5"],
        backend: ["Laravel (existing backend)"],
        data: ["MySQL"],
        infra: ["Docker", "Traefik", "Heroku (staging/hosting)"],
    },

    architectureImage: null,

    features: [
        "Incremental page-by-page migration strategy that keeps the existing Laravel app stable while modernizing the UI.",
        "Reusable React layout patterns/components to standardize styling and reduce duplicated UI logic.",
        "Improved routing/navigation behavior across app entry points (e.g., app vs profile/dashboard) to support a multi-surface platform.",
        "Modern build tooling via Vite for faster iteration and a cleaner asset pipeline compared to legacy frontend setup.",
    ],

    metrics: null,

    challenges: [
        {
            challenge:
                "Modernizing a large legacy Laravel Blade UI without breaking existing production behavior.",
            solution:
                "Used React + Inertia as an incremental bridge so pages can be migrated one at a time while keeping server-side routing/data intact. Focused on reusable layouts and predictable patterns to avoid one-off page implementations.",
            result:
                "Enabled a safer rollout path where new React pages can ship alongside legacy pages, reducing risk and keeping development velocity high.",
        },
        {
            challenge:
                "Handling multiple entry points/contexts (e.g., main app vs profile/dashboard) while keeping navigation behavior consistent.",
            solution:
                "Centralized logic for determining which surface the user is in and ensured link behavior matches context (internal vs external routing) to prevent misroutes and UI inconsistency.",
            result:
                "Cleaner navigation behavior and a more maintainable foundation for adding additional surfaces like admin sections over time.",
        },
    ],

    improvements: [
        "Add a lightweight architecture diagram + migration notes page (what moved, what stayed, rollout strategy) for faster onboarding.",
        "Formalize UI component guidelines (naming, structure, props patterns) to keep future page migrations consistent across contributors.",
        "Add basic automated checks (linting + type safety, and a small set of UI regression smoke tests) to reduce breakage as more pages migrate.",
    ],
};