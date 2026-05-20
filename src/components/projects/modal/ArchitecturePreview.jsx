import { buildProjectPath } from "../../../domain/projects/routing";
import { PUBLIC_ROUTES } from "../../../runtime/paths";
import { buildArchitectureViewerUrl, getInlineSvgUrl, isSvgUrl } from "../viewer/viewerUrl";

function getProjectReturnTo(data) {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith(`${PUBLIC_ROUTES.PROJECT_BASE}/`)) return currentPath;

    const permalink = String(data.permalink || data.id || "").trim();
    return permalink ? buildProjectPath(permalink) : PUBLIC_ROUTES.HOME;
}

export default function ArchitecturePreview({ data, isAdminPreview = false }) {
    const archImg = data.architectureImageUrl || null;
    const previewUrl = archImg
        ? (isAdminPreview ? archImg : getInlineSvgUrl(archImg))
        : null;
    const projectTitle = String(data.title || "").trim() || "Project";
    const diagramTitle = `${projectTitle} architecture diagram`;
    const fallbackText = archImg
        ? "Architecture preview unavailable in local dev without Netlify"
        : "No architecture image yet";

    if (!archImg || !previewUrl) {
        return (
            <div
                role="note"
                aria-label={`${projectTitle} architecture preview status`}
                className="w-full h-40 rounded-xl border border-card-border bg-scrim/20 grid place-items-center text-text/60 text-sm"
            >
                {fallbackText}
            </div>
        );
    }

    if (isAdminPreview) {
        return (
            <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border border-card-border bg-scrim/20">
                    <div className="w-full aspect-[16/9]">
                        <img
                            src={previewUrl}
                            alt={diagramTitle}
                            className="w-full h-full block object-contain"
                        />
                    </div>
                </div>
            </div>
        );
    }

    const viewerUrl = buildArchitectureViewerUrl({
        src: previewUrl,
        title: `${projectTitle} Architecture`,
        returnTo: getProjectReturnTo(data),
    });
    const isSvg = isSvgUrl(archImg);

    return (
        <div className="space-y-2">
            <div className="relative rounded-xl focus-within:ring-4 focus-within:ring-accent-soft/60">
                {/* Clickable overlay */}
                <a
                    href={viewerUrl}
                    aria-label={`Open ${diagramTitle} viewer`}
                    className="absolute inset-0 z-10 cursor-pointer rounded-xl focus:outline-none"
                >
                    <span className="sr-only">Open full architecture diagram</span>
                </a>

                <div className="overflow-hidden rounded-xl border border-card-border bg-scrim/20">
                    {/* SVG Architecture Image */}
                    <div className="w-full aspect-[16/9]">
                        {isSvg ? (
                            <object
                                data={previewUrl}
                                type="image/svg+xml"
                                className="w-full h-full block"
                                aria-label={diagramTitle}
                                aria-hidden="true"
                                tabIndex={-1}
                            >
                                {diagramTitle}
                            </object>
                        ) : (
                            <img
                                src={previewUrl}
                                alt=""
                                aria-hidden="true"
                                className="w-full h-full block object-contain"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
