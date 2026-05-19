import { buildProjectPath } from "../../../domain/projects/routing";
import { PUBLIC_ROUTES } from "../../../runtime/paths";
import { buildArchitectureViewerUrl, getInlineSvgUrl, isSvgUrl } from "../viewer/viewerUrl";

function getProjectReturnTo(data) {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith(`${PUBLIC_ROUTES.PROJECT_BASE}/`)) return currentPath;

    const permalink = String(data.permalink || data.id || "").trim();
    return permalink ? buildProjectPath(permalink) : PUBLIC_ROUTES.HOME;
}

export default function ArchitecturePreview({ data }) {
    const archImg = data.architectureImageUrl || null;
    const previewUrl = archImg ? getInlineSvgUrl(archImg) : null;
    const fallbackText = archImg
        ? "Architecture preview unavailable in local dev without Netlify"
        : "No architecture image yet";

    if (!archImg || !previewUrl) {
        return (
            <div className="w-full h-40 rounded-xl border border-card-border bg-scrim/20 grid place-items-center text-text/60 text-sm">
                {fallbackText}
            </div>
        );
    }

    const viewerUrl = buildArchitectureViewerUrl({
        src: previewUrl,
        title: data.title ? `${data.title} Architecture` : "Architecture Diagram",
        returnTo: getProjectReturnTo(data),
    });
    const isSvg = isSvgUrl(archImg);

    return (
        <div className="space-y-2">
            <div className="relative rounded-xl focus-within:ring-4 focus-within:ring-accent-soft/60">
                {/* Clickable overlay */}
                <a
                    href={viewerUrl}
                    aria-label={`Open ${data.title} architecture diagram viewer page`}
                    className="absolute inset-0 z-10 cursor-pointer rounded-xl focus:outline-none"
                >
                    <span className="sr-only">Open full diagram</span>
                </a>

                <div className="overflow-hidden rounded-xl border border-card-border bg-scrim/20">
                    {/* SVG Architecture Image */}
                    <div className="w-full aspect-[16/9]">
                        {isSvg ? (
                            <object
                                data={previewUrl}
                                type="image/svg+xml"
                                className="w-full h-full block"
                                aria-label={`${data.title} architecture`}
                            />
                        ) : (
                            <img
                                src={previewUrl}
                                alt={`${data.title} architecture`}
                                className="w-full h-full block object-contain"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
