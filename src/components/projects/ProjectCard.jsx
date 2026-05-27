import { forwardRef } from 'react';

import CardSurface from '../ui/CardSurface';
import GradientText from '../ui/GradientText';
import Text from '../ui/Text';
import TechTagMarquee from './TechTagMarquee';
import VideoGlowFrame from '../media/VideoGlowFrame';
import { canUseNetlifyFunctions } from '../../runtime/netlify';
import useHoverPreviewIntent from '../../hooks/useHoverPreviewIntent';

import placeholderVideo from '../../assets/placeholder.mp4';

const HOVER_INTENT_MS = 250;
const FADE_DURATION_MS = HOVER_INTENT_MS * 3;

const ProjectCard = forwardRef(function ProjectCard({ 
    id,
    isActivePreview = false,
    requestPreview,
    clearPreview,
    lastInputRef,
    image, 
    video, 
    title, 
    desc, 
    link, 
    tags, 
    onOpenModal, 
    isModalOpen,
    linkTabIndex,
}, ref) {
    const safeVideo =
        video === null || video === '' || video === undefined || video === 'NULL' || !canUseNetlifyFunctions()
            ? placeholderVideo
            : video;

    const {
        videoRef,
        isPreviewed,
        isLoadingVideo,
        enablePreview,
        disablePreviewAndRelease,
    } = useHoverPreviewIntent({
        id,
        safeVideo,
        isActivePreview,
        isModalOpen,
        requestPreview,
        clearPreview,
        hoverIntentMs: HOVER_INTENT_MS,
    });

    const handleOnClick = (e) => {
        const button = e.button ?? e?.nativeEvent?.button; // 0=left, 1=middle
        const isModified = e.metaKey || e.ctrlKey || button === 1;

        // Ctrl/Cmd click (new tab) OR middle click => let the browser do its normal link thing
        if (isModified) return;

        e.preventDefault();
        const restoreFocusOnClose =
            lastInputRef?.current === 'keyboard'
            && e.currentTarget.contains(document.activeElement);

        clearPreview?.(id); // release global ownership
        onOpenModal?.({ restoreFocusOnClose });
    };

    const handleOnMouseEnter = (e) => {
        enablePreview(e);
    };

    const handleOnMouseLeave = (e) => {
        if(!isModalOpen) {
            disablePreviewAndRelease(e);
        }
    };

    const handleOnFocus = (e) => {
        if (isModalOpen || lastInputRef.current === 'pointer') return;

        enablePreview(e);
    };

    const handleOnBlur = (e) => {
        const root = e.currentTarget;

        // Let focus settle, then decide if the card was actually left
        requestAnimationFrame(() => {
            if (root.contains(document.activeElement)) return; // still inside card

            disablePreviewAndRelease(e);
        });
    };

    return (
        <CardSurface
            ref={ref}
            link={link}
            linkTabIndex={linkTabIndex}
            title={`Open ${title} case study`}
            onClick={handleOnClick}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
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
                            <GradientText
                                animated={!isPreviewed && !isModalOpen}
                                className={[
                                    "py-3 font-extrabold text-balance",
                                    "text-[clamp(1.25rem,11cqw,10rem)]",
                                    "leading-[1.05] md:leading-[1.1]",
                                    "drop-shadow-modal-title",
                                ].join(" ")}
                                style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
                            >
                                {title}
                            </GradientText>
                        </div>
                    </VideoGlowFrame>
                )}
            </div>

            <Text as="div" variant="body" className="px-8 pt-6 pb-4">
                {desc}
            </Text>

            <div className='pb-4 mb-0 mt-auto text-sm md:text-md lg:text-xl'>
                <TechTagMarquee
                    className='px-3 py-1 font-semibold rounded-lg bg-card-att text-text'
                    tags={tags}
                />
            </div>
        </CardSurface>
    )
});

export default ProjectCard;
