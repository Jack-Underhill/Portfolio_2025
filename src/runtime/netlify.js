export function canUseNetlifyFunctions() {
    return import.meta.env.VITE_ENABLE_NETLIFY_FUNCTIONS !== "false";
}
