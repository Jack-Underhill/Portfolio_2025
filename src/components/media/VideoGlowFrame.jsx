import { forwardRef } from "react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const VideoGlowFrame = forwardRef(function VideoGlowFrame({
    src,
    thumbnail = null,
    isPlaying = false,

    // Outter div styling
    className = "",

    // video styling
    videoClassName = "",

    // Optional overlay (titles, badges, etc.)
    children,

    // Any other <video> props
    ...videoProps
}, ref) {
    return (
        <div className={cx("relative", className)}>
            {/* Glow wrapper */}
            {isPlaying && (
                <div
                    className={cx(
                        "absolute z-0 -inset-1 blur",
                        "transition duration-500 ease-in-out",
                        "animated-gradient bg-gradient-to-r",
                        "from-sky-400 via-emerald-50 to-sky-400",
                    )}
                />
            )}

            {/* Video */}
            <video
                ref={ref}
                src={src}
                poster={thumbnail}
                {...videoProps}
                className={cx("relative z-10 w-full h-auto aspect-video object-cover rounded-xl", videoClassName)}
            />

            {/* Optional overlay content */}
            {children ? (
                <div className="absolute inset-0 z-20">{children}</div>
            ) : null}
        </div>
    );
});

export default VideoGlowFrame;