import { forwardRef } from "react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const VideoGlowFrame = forwardRef(function VideoGlowFrame({
    src,
    thumbnail = null,
    isVideoVisible = false,
    isGlowActive = false,
    shouldPrefetchVideo = false,

    // Outter div styling
    className = "",

    // video styling
    videoClassName = "",

    // Optional overlay (titles, badges, etc.)
    children,

    // Any other <video> props
    ...videoProps
}, ref) {
    const shouldShowVideo = Boolean(!shouldPrefetchVideo || isVideoVisible);
    const shouldShowThumbnail = Boolean(shouldPrefetchVideo && !isVideoVisible);
    const shouldOverlayImage = Boolean(shouldPrefetchVideo && thumbnail);

    return (
        <div className={cx("relative", className)}>
            {/* Glow wrapper */}
            {isGlowActive && (
                <div
                    className={cx(
                        "absolute z-0 -inset-1 blur",
                        "transition duration-500 ease-in-out",
                        "animated-gradient bg-gradient-to-r",
                        "from-accent-soft via-text to-accent-soft",
                    )}
                />
            )}

            {/* Video */}
            <video
                ref={ref}
                src={src}
                poster={thumbnail}
                {...videoProps}
                className={cx(
                    "relative z-10 w-full h-auto aspect-video object-cover rounded-xl",
                    "pointer-events-none transition-opacity duration-500 ease-in-out",
                    shouldShowVideo ? "opacity-100" : "opacity-0",
                    videoClassName,
                )}
            />

            {shouldOverlayImage ? (
                <img
                    src={thumbnail}
                    alt=""
                    aria-hidden="true"
                    className={cx(
                        "absolute inset-0 z-[11] w-full h-full object-cover rounded-xl",
                        "pointer-events-none transition-opacity duration-500 ease-in-out",
                        shouldShowThumbnail ? "opacity-100" : "opacity-0",
                    )}
                />
            ) : null}

            {/* Optional overlay content */}
            {children ? (
                <div className="absolute inset-0 z-20">{children}</div>
            ) : null}
        </div>
    );
});

export default VideoGlowFrame;
