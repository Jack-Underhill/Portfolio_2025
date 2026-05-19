import { useCallback, useEffect, useMemo, useState } from "react";

import { getSafeReturnTo, getTrustedViewerSrc } from "./viewerUrl";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function clampZoom(value) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function getViewerParams() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title")?.trim() || "Architecture Diagram";
    const returnTo = getSafeReturnTo(params.get("returnTo"));
    const src = getTrustedViewerSrc(params.get("src"));

    return {
        title,
        returnTo,
        src,
    };
}

export default function ArchitectureViewer() {
    const { title, returnTo, src } = useMemo(() => getViewerParams(), []);
    const [zoom, setZoom] = useState(1);
    const [loadState, setLoadState] = useState(src ? "loading" : "empty");
    const zoomPercent = Math.round(zoom * 100);

    const zoomIn = useCallback(() => {
        setZoom((current) => clampZoom(current + ZOOM_STEP));
    }, []);

    const zoomOut = useCallback(() => {
        setZoom((current) => clampZoom(current - ZOOM_STEP));
    }, []);

    const fitToScreen = useCallback(() => {
        setZoom(1);
    }, []);

    const goBack = useCallback(() => {
        window.location.assign(returnTo || "/");
    }, [returnTo]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.defaultPrevented) return;

            const tagName = event.target?.tagName?.toLowerCase();
            if (tagName === "input" || tagName === "textarea" || tagName === "select") return;

            if (event.key === "Escape") {
                event.preventDefault();
                goBack();
            }

            if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                zoomIn();
            }

            if (event.key === "-") {
                event.preventDefault();
                zoomOut();
            }

            if (event.key === "0") {
                event.preventDefault();
                fitToScreen();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fitToScreen, goBack, zoomIn, zoomOut]);

    return (
        <main className="min-h-screen bg-page text-text" aria-labelledby="architecture-viewer-title">
            <div className="viewer-radial-overlay pointer-events-none fixed inset-0 bg-blend-soft bg-cover opacity-100" />

            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-card-border bg-scrim/25 px-4 py-3 backdrop-blur sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft/80">
                            Architecture
                        </p>
                        <h1 id="architecture-viewer-title" className="truncate text-lg font-bold text-text sm:text-2xl">
                            {title}
                        </h1>
                        <p id="architecture-viewer-shortcuts" className="sr-only">
                            Keyboard shortcuts: Escape returns to the project, plus zooms in, minus zooms out, and 0 resets zoom to 100 percent.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div
                            role="group"
                            aria-label="Diagram zoom controls"
                            aria-describedby="architecture-viewer-shortcuts"
                            className="flex items-center overflow-hidden rounded-lg border border-text/15 bg-scrim/30"
                        >
                            <button
                                type="button"
                                onClick={zoomOut}
                                aria-label="Zoom out architecture diagram"
                                className="grid h-10 w-10 place-items-center text-lg font-semibold text-text transition hover:bg-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-text/35"
                                disabled={!src || zoom <= MIN_ZOOM}
                            >
                                -
                            </button>
                            <button
                                type="button"
                                onClick={fitToScreen}
                                aria-label="Reset architecture diagram zoom to 100 percent"
                                className="h-10 min-w-14 border-x border-text/15 px-3 text-xs font-bold uppercase tracking-[0.12em] text-text transition hover:bg-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-text/35"
                                disabled={!src}
                            >
                                Fit
                            </button>
                            <button
                                type="button"
                                onClick={zoomIn}
                                aria-label="Zoom in architecture diagram"
                                className="grid h-10 w-10 place-items-center text-lg font-semibold text-text transition hover:bg-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:text-text/35"
                                disabled={!src || zoom >= MAX_ZOOM}
                            >
                                +
                            </button>
                        </div>

                        <a
                            href={returnTo}
                            aria-label="Back to project case study"
                            className="shrink-0 rounded-lg border border-accent-soft/40 bg-accent-soft/10 px-4 py-2 text-sm font-semibold text-text transition hover:border-focus-ring hover:bg-accent-soft/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        >
                            Back
                        </a>
                    </div>
                </header>

                <section
                    className="flex flex-1 items-stretch justify-center overflow-hidden p-3 sm:p-5"
                    aria-label="Architecture diagram viewer"
                >
                    <div
                        className="scrollbar-modal relative h-[calc(100vh-7rem)] w-full overflow-auto rounded-lg border border-text/15 bg-scrim/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        role="region"
                        aria-label={`${title} diagram canvas`}
                        aria-describedby="architecture-viewer-shortcuts"
                        tabIndex={src ? 0 : undefined}
                    >
                        {src ? (
                            <div
                                className="grid min-h-full min-w-full place-items-center p-3 sm:p-5"
                                style={{
                                    width: `${zoom * 100}%`,
                                    height: `${zoom * 100}%`,
                                }}
                            >
                                <object
                                    data={src}
                                    type="image/svg+xml"
                                    className="h-full w-full"
                                    aria-label={`${title} architecture diagram`}
                                    onLoad={() => setLoadState("loaded")}
                                    onError={() => setLoadState("error")}
                                >
                                    <p className="p-6 text-center text-sm text-text/70">
                                        Diagram unavailable
                                    </p>
                                </object>
                            </div>
                        ) : (
                            <div className="grid h-full place-items-center px-6 text-center">
                                <div role="status" aria-live="polite" aria-atomic="true">
                                    <p className="text-sm font-semibold text-text">
                                        Diagram unavailable
                                    </p>
                                    <p className="mt-2 text-sm text-text/65">
                                        No trusted architecture diagram was provided.
                                    </p>
                                </div>
                            </div>
                        )}

                        {loadState === "loading" && (
                            <div
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                className="pointer-events-none absolute inset-0 grid place-items-center bg-scrim/20 text-sm font-semibold text-text/70"
                            >
                                Loading diagram...
                            </div>
                        )}

                        {loadState === "error" && (
                            <div className="absolute inset-0 grid place-items-center bg-page/90 px-6 text-center">
                                <div role="alert" aria-live="assertive" aria-atomic="true">
                                    <p className="text-sm font-semibold text-text">
                                        Diagram unavailable
                                    </p>
                                    <p className="mt-2 text-sm text-text/65">
                                        The architecture diagram could not be loaded.
                                    </p>
                                </div>
                            </div>
                        )}

                        {src && loadState !== "error" && (
                            <div
                                role={loadState === "loaded" ? "status" : undefined}
                                aria-live={loadState === "loaded" ? "polite" : "off"}
                                aria-atomic="true"
                                className="pointer-events-none absolute bottom-3 right-3 rounded bg-scrim/55 px-2 py-1 text-xs font-semibold text-text/70"
                            >
                                <span className="sr-only">Zoom </span>
                                {zoomPercent}%
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
