import { useEffect, useMemo, useRef } from "react";

import Section from "./Section";
import CardSurface from "../../ui/CardSurface";
import Header from "./Header";
import Challenges from "./Challenges";
import ArchitecturePreview from "./ArchitecturePreview";
import TechStack from "./TechStack";
import VideoGlowFrame from "../../media/VideoGlowFrame";
import BulletList from "./BulletList";
import { canUseNetlifyFunctions } from "../../../runtime/netlify";

import placeholderVideo from "../../../assets/placeholder.mp4";

function isNonEmptyArray(arr) { return Array.isArray(arr) && arr.length > 0; }

export default function ProjectModal({
    isOpen,
    project,
    onClose,
}) {
    const data = useMemo(() => {
        return { ...(project ?? {}) };
    }, [project]);

    const closeBtnRef = useRef(null);
    const lastActiveElRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const root = document.documentElement;
        const prevModalOpen = root.getAttribute("data-modal-open");
        root.setAttribute("data-modal-open", "true");

        // Save focus and lock scroll
        lastActiveElRef.current = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Focus close button for accessibility
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
            // Restore focus
            const el = lastActiveElRef.current;
            if (el && typeof el.focus === "function") el.focus();

            if (prevModalOpen === null) root.removeAttribute("data-modal-open");
            else root.setAttribute("data-modal-open", prevModalOpen);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const heroVideo = data.videoUrl;
    const heroImage = data.imageUrl;

    const safeVideo =
        !canUseNetlifyFunctions()
            ? placeholderVideo
            : heroVideo === null || heroVideo === '' || heroVideo === undefined || heroVideo === 'NULL'
                ? null
                : heroVideo;

    const hasMetrics = isNonEmptyArray(data.metrics);
    const hasChallenges = isNonEmptyArray(data.challenges);
    const hasImprovements = isNonEmptyArray(data.improvements);

    const handleBackdropMouseDown = (e) => {
        // Only close if they clicked the backdrop itself
        if (e.target === e.currentTarget) onClose?.();
    };

    return (
        <div
            id="Modal"
            className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6 bg-scrim/60 backdrop-blur-sm"
            onMouseDown={handleBackdropMouseDown}
            aria-modal="true"
            role="dialog"
        >
            <CardSurface 
                className="p-2" 
                isPremiumSheenActive={true}
                data-aos="zoom-in-up"
            >
                <div className="w-full max-w-[80vw] xl:max-w-6xl h-[92vh] overflow-hidden rounded-xl flex flex-col">
                    <Header data={data} onClose={onClose} closeBtnRef={closeBtnRef} />

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-modal p-8">
                        {/* top band */}
                        <div className="space-y-6">
                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Media */}
                                <div className="lg:w-6/10 space-y-4">
                                    <div className="relative w-full aspect-video rounded-xl border border-card-border bg-scrim/20">
                                        {safeVideo ? (
                                            <VideoGlowFrame
                                                src={safeVideo}
                                                thumbnail={heroImage}
                                                isPlaying={true}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : heroImage ? (
                                            <img
                                                className="relative z-10 w-full h-auto aspect-video object-cover rounded-xl"
                                                src={heroImage}
                                                alt={`${data.title} preview`}
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center text-text/60 text-sm">
                                                No demo media yet
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* stacked to the right of Media */}
                                <div className="lg:w-4/10 space-y-6">
                                    <Section title="Overview">
                                        <p>{data.overview}</p>
                                    </Section>

                                    <Section title="My Role">
                                        <p>{data.role}</p>
                                    </Section>
                                </div>
                            </div>

                            {/* responsive blocks grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tech Stack (compact) */}
                                <Section title="Tech Stack">
                                    <TechStack data={data} />
                                </Section>

                                {/* ArchitecturePreview */}
                                <Section title="Architecture Preview">
                                    <ArchitecturePreview data={data} />
                                </Section>

                                {/* Features */}
                                <Section
                                    title="Key Features"
                                    isSingleColumn={!hasMetrics}
                                >
                                    <BulletList textArray={data.features} />
                                </Section>

                                {/* Metrics (optional) */}
                                {hasMetrics && (
                                    <Section title="Metrics">
                                        <BulletList textArray={data.metrics} />
                                    </Section>
                                )}

                                {/* Challenges */}
                                {hasChallenges && (
                                    <Section
                                        title="Challenges & Solutions"
                                        isSingleColumn={true}
                                    >
                                        <Challenges data={data} />
                                    </Section>
                                )}

                                {/* Improve Next */}
                                {hasImprovements && (
                                    <Section
                                        title="What I’d Improve Next"
                                        isSingleColumn={true}
                                    >
                                        <BulletList textArray={data.improvements} />
                                    </Section>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardSurface>
        </div>
    );
}
