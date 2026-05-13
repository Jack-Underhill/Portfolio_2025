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
        <main className="min-h-screen bg-[#0E1419] text-emerald-50">
            <div
                className="pointer-events-none fixed inset-0 bg-blend-soft bg-cover opacity-100"
                style={{
                    backgroundImage: "radial-gradient(circle at 72% 50%, rgba(56,189,248,0.28) 0%, rgba(56,189,248,0.12) 40%, transparent 90%), url('/black-linen.png')",
                }}
            />

            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-card-border bg-black/25 px-4 py-3 backdrop-blur sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
                            Architecture
                        </p>
                        <h1 className="truncate text-lg font-bold text-emerald-50 sm:text-2xl">
                            {title}
                        </h1>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center overflow-hidden rounded-lg border border-emerald-50/15 bg-black/30">
                            <button
                                type="button"
                                onClick={zoomOut}
                                aria-label="Zoom out"
                                className="grid h-10 w-10 place-items-center text-lg font-semibold text-emerald-50 transition hover:bg-emerald-50/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:text-emerald-50/35"
                                disabled={!src || zoom <= MIN_ZOOM}
                            >
                                -
                            </button>
                            <button
                                type="button"
                                onClick={fitToScreen}
                                aria-label="Fit diagram to screen"
                                className="h-10 min-w-14 border-x border-emerald-50/15 px-3 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50 transition hover:bg-emerald-50/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:text-emerald-50/35"
                                disabled={!src}
                            >
                                Fit
                            </button>
                            <button
                                type="button"
                                onClick={zoomIn}
                                aria-label="Zoom in"
                                className="grid h-10 w-10 place-items-center text-lg font-semibold text-emerald-50 transition hover:bg-emerald-50/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:text-emerald-50/35"
                                disabled={!src || zoom >= MAX_ZOOM}
                            >
                                +
                            </button>
                        </div>

                        <a
                            href={returnTo}
                            className="shrink-0 rounded-lg border border-sky-300/40 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-sky-200 hover:bg-sky-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                        >
                            Back
                        </a>
                    </div>
                </header>

                <section className="flex flex-1 items-stretch justify-center overflow-hidden p-3 sm:p-5">
                    <div className="scrollbar-modal relative h-[calc(100vh-7rem)] w-full overflow-auto rounded-lg border border-emerald-50/15 bg-black/20">
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
                                    <p className="p-6 text-center text-sm text-emerald-50/70">
                                        Diagram unavailable
                                    </p>
                                </object>
                            </div>
                        ) : (
                            <div className="grid h-full place-items-center px-6 text-center">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-50">
                                        Diagram unavailable
                                    </p>
                                    <p className="mt-2 text-sm text-emerald-50/65">
                                        No trusted architecture diagram was provided.
                                    </p>
                                </div>
                            </div>
                        )}

                        {loadState === "loading" && (
                            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20 text-sm font-semibold text-emerald-50/70">
                                Loading diagram...
                            </div>
                        )}

                        {loadState === "error" && (
                            <div className="absolute inset-0 grid place-items-center bg-[#0E1419]/90 px-6 text-center">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-50">
                                        Diagram unavailable
                                    </p>
                                    <p className="mt-2 text-sm text-emerald-50/65">
                                        The architecture diagram could not be loaded.
                                    </p>
                                </div>
                            </div>
                        )}

                        {src && loadState !== "error" && (
                            <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-xs font-semibold text-emerald-50/70">
                                {Math.round(zoom * 100)}%
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
