export function getFileExtension(file) {
    if (!file?.name) return '';
    const dot = file.name.lastIndexOf('.');
    return dot === -1 ? '' : file.name.slice(dot); // includes "."
}

export function slugify(label, fallback) {
    const base = (label || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return base || fallback;
}

export function normalizeStringArray(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();

    for (const raw of arr) {
        const t = String(raw ?? '').trim();
        if (!t) continue;
        
        const key = t.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        out.push(t);
    }
    return out;
}

export function flattenTechStack(techStack, TECH_STACK_ORDER) {
    if (!techStack || typeof techStack !== "object") return [];

    const out = [];
    const seen = new Set();

    for (const cat of TECH_STACK_ORDER) {
        const arr = Array.isArray(techStack?.[cat]) ? techStack[cat] : [];

        for (const raw of arr) {
            const t = String(raw ?? '').trim();
            if (!t) continue;

            const key = t.toLowerCase();
            if (seen.has(key)) continue;

            seen.add(key);
            out.push(t);
        }
    }

    return out;
}