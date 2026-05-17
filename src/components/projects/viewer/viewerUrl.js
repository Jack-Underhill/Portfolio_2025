import { canUseNetlifyFunctions } from "../../../runtime/netlify";
import { NETLIFY_FUNCTION_PATHS, PUBLIC_ROUTES } from "../../../runtime/paths";

const ALLOWED_ARCHITECTURE_PATH_PREFIX = "/storage/v1/object/public/portfolio-assets/project-architecture/";

export function isSvgUrl(url) {
    try {
        return new URL(url).pathname.toLowerCase().endsWith(".svg");
    } catch {
        return String(url || "").toLowerCase().split("?")[0].endsWith(".svg");
    }
}

export function getInlineSvgUrl(url) {
    if (!isSvgUrl(url)) return url;
    if (!canUseNetlifyFunctions()) return null;

    return `${NETLIFY_FUNCTION_PATHS.INLINE_SVG}?url=${encodeURIComponent(url)}`;
}

export function isTrustedSupabaseArchitectureSvgUrl(rawUrl) {
    if (!rawUrl) return false;

    try {
        const url = new URL(rawUrl);
        const isSupabaseStorage = url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
        const isProjectArchitectureSvg =
            url.pathname.startsWith(ALLOWED_ARCHITECTURE_PATH_PREFIX) &&
            url.pathname.toLowerCase().endsWith(".svg");

        return isSupabaseStorage && isProjectArchitectureSvg;
    } catch {
        return false;
    }
}

export function getTrustedViewerSrc(rawSrc, origin = window.location.origin) {
    if (!rawSrc || !canUseNetlifyFunctions()) return null;

    try {
        const url = new URL(rawSrc, origin);
        const isLocalProxy =
            url.origin === origin &&
            url.pathname === NETLIFY_FUNCTION_PATHS.INLINE_SVG;

        if (!isLocalProxy) return null;

        const targetUrl = url.searchParams.get("url");
        if (!isTrustedSupabaseArchitectureSvgUrl(targetUrl)) return null;

        return `${url.pathname}?url=${encodeURIComponent(targetUrl)}`;
    } catch {
        return null;
    }
}

export function getSafeReturnTo(rawReturnTo, fallback = "/") {
    const returnTo = String(rawReturnTo || "").trim();
    const safeFallback = String(fallback || "/").startsWith("/") ? String(fallback || "/") : "/";

    if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return safeFallback;
    return returnTo;
}

export function buildArchitectureViewerUrl({ src, title, returnTo }) {
    const params = new URLSearchParams();

    if (src) params.set("src", src);
    if (title) params.set("title", title);
    params.set("returnTo", getSafeReturnTo(returnTo));

    return `${PUBLIC_ROUTES.ARCHITECTURE_VIEWER}?${params.toString()}`;
}
