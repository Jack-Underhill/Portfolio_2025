import { useState, useRef, useEffect } from 'react';
import CardSurface from './CardSurface';
import TechTagMarquee from './TechTagMarquee';
import VideoGlowFrame from './VideoGlowFrame';

import placeholderVideo from '../assets/placeholder.mp4';

const HOVER_INTENT_MS = 250;
const FADE_DURATION_MS = HOVER_INTENT_MS * 3;

function ProjectCard({ 
    id,
    isActivePreview = false,
    requestPreview,
    clearPreview,
    image, 
    video, 
    title, 
    desc, 
    link, 
    tags, 
    onOpenModal 
}) {
    const [isPreviewed, setIsPreviewed] = useState(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);

    const [showGradient, setShowGradient] = useState(true);
    const [animateGradient, setAnimateGradient] = useState(true);

    const videoRef = useRef(null);
    const hoverTimerRef = useRef(null);

    const safeVideo =
        video === null || video === '' || video === undefined || video === 'NULL'
            ? placeholderVideo
            : video;

    useEffect(() => {
        console.log('[ProjectCard::useEffect] isActivePreview changed:', isActivePreview);
        window.clearTimeout(hoverTimerRef.current);

        if (isActivePreview) {
            setIsPreviewed(true);

            // hover intent: don't even attach src unless long enough hovered
            hoverTimerRef.current = window.setTimeout(() => {
                setIsLoadingVideo(true); // attaches src
            }, HOVER_INTENT_MS);

            return () => window.clearTimeout(hoverTimerRef.current);
        }

        disablePreviewLocal();
    }, [isActivePreview]);

    // This runs AFTER React commits the src to the <video />
    useEffect(() => {
        console.log('[ProjectCard::useEffect] isPreviewed, isLoadingVideo changed:', isPreviewed, isLoadingVideo);
        if(!isPreviewed || !isLoadingVideo) return;

        const v = videoRef.current;
        if (!v) return;

        let cancelled = false;

        const tryPlay = async () => {
            if(cancelled) return;
            try {
                await v.play();
            } catch {
                // Ignore (browser can occasionally block/queue)
            } 
        };

        // If already buffered enough, play immediately
        if(v.readyState >= 2) {
            tryPlay();
            return () => {  cancelled = true; };
        }

        // Otherwise wait for it to be ready
        const onCanPlay = () => tryPlay();
        v.addEventListener('canplay', onCanPlay, { once: true });

        return () => {
            cancelled = true;
            v.removeEventListener('canplay', onCanPlay);
        };
    }, [isPreviewed, isLoadingVideo]);

    useEffect(() => {
        console.log('[ProjectCard::useEffect] isPreviewed changed:', isPreviewed);
        // show gradient whenever NOT previewing
        setShowGradient(!isPreviewed);
    }, [isPreviewed]);

    useEffect(() => {
        console.log('[ProjectCard::useEffect] showGradient changed:', showGradient);
        if (showGradient) {
            // turning on: enable animation immediately
            setAnimateGradient(true);
        } else {
            // turning off: wait for fade to finish, then disable animation
            const t = setTimeout(() => setAnimateGradient(false), FADE_DURATION_MS);
            return () => clearTimeout(t);
        }
    }, [showGradient]);

    const handleCardClick = (e) => {
        console.log('[ProjectCard::handleCardClick] type:', e?.type);
        const button = e.button ?? e?.nativeEvent?.button; // 0=left, 1=middle
        const isModified = e.metaKey || e.ctrlKey || button === 1;

        // Ctrl/Cmd click (new tab) OR middle click => let the browser do its normal link thing
        if (isModified) return;

        e.preventDefault();
        disablePreviewAndRelease();
        onOpenModal?.();
    };

    const handleBlurRelease = (e) => {
        console.log('[ProjectCard::handleBlurRelease] type:', e?.type);

        const root = e.currentTarget;

        // Let focus settle, then decide if the card was actually left
        requestAnimationFrame(() => {
            if (root.contains(document.activeElement)) return; // still inside card
            disablePreviewLocal();
            clearPreview?.(id);
        });
    };

    const enablePreview = (e) => {
        if(safeVideo) {
            console.log('[ProjectCard::enablePreview] type:', e?.type);
            // If focus moved from one child to another child inside the card, ignore
            if (e?.type === 'focus' && e.currentTarget?.contains(e.relatedTarget)) return;
            requestPreview?.(id); // claim global ownership
        }
    };

    const disablePreviewAndRelease = (e) => {
        console.log('[ProjectCard::disablePreviewAndRelease] type:', e?.type);
        // If focus moved to another element still inside the card, ignore.
        if (e?.type === 'blur' && e.currentTarget?.contains(e.relatedTarget)) return;
        disablePreviewLocal();
        clearPreview?.(id); // release global ownership
    };

    const disablePreviewLocal = () => {
        console.log('[ProjectCard::disablePreviewLocal]');
        window.clearTimeout(hoverTimerRef.current);
        setIsPreviewed((prev) => (prev ? false : prev));
        setIsLoadingVideo((prev) => (prev ? false : prev)); // detaches src

        const v = videoRef.current;
        if (v) {
            v.pause();
            v.currentTime = 0;

            // show poster again
            v.removeAttribute('src');
            v.load();
        }
    };

    return (
        <CardSurface
            link={link}
            title={`Open case study | ${title}`}
            onClick={handleCardClick}
            onMouseEnter={enablePreview}
            onMouseLeave={disablePreviewAndRelease}
            onFocus={enablePreview}
            onBlur={handleBlurRelease}
            data-aos="flip-left"
            className='h-full p-2 flex flex-col'
        >
            <div className='relative w-full aspect-video rounded-xl group/image [container-type:inline-size]'>
                {safeVideo && (
                    <VideoGlowFrame
                        ref={videoRef}
                        src={isLoadingVideo ? safeVideo : undefined}
                        thumbnail={image}
                        isPlaying={isPreviewed}
                        muted
                        loop
                        playsInline
                        preload={isLoadingVideo ? 'metadata' : 'none'}
                    >
                        {/* Centered overlay title */}
                        <div 
                            className='absolute inset-0 z-20 px-6 flex items-center justify-center text-center bg-black/20 rounded-xl'
                            style={{
                                transition: `opacity ${FADE_DURATION_MS}ms ease`,
                                opacity: isPreviewed ? 0 : 1,
                            }}
                        >
                            <span 
                                className={[
                                    animateGradient ? "animated-gradient" : "",
                                    "py-3 font-extrabold ",
                                    "bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400",
                                    "text-transparent text-balance bg-clip-text",
                                    "text-[clamp(1.25rem,11cqw,10rem)]",
                                    "leading-[1.05] md:leading-[1.1]",
                                    "drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]",
                                ].join(" ")}
                                style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
                            >
                                {title}
                            </span>
                        </div>
                    </VideoGlowFrame>
                )}
            </div>

            <div className='px-8 pt-6 pb-4 text-xl font-semibold text-emerald-50'>
                {desc}
            </div>

            <div className='pb-4 mb-0 mt-auto text-sm md:text-md lg:text-xl'>
                <TechTagMarquee
                    className='px-3 py-1 font-semibold rounded-lg bg-card-att text-emerald-50'
                    tags={tags}
                />
            </div>
        </CardSurface>
    )
}

export default ProjectCard;