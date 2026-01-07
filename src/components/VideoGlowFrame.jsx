const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function VideoGlowFrame({
    src,

    // Outter div styling
    className = "",

    // video styling
    videoClassName = "",

    // Optional overlay (titles, badges, etc.)
    children,

    // Any other <video> props
    ...videoProps
}) {
    return (
        <div className={cx("relative", className)}>
            {/* Glow wrapper */}
            <div
                className={cx(
                    "absolute z-0 -inset-1 blur",
                    "transition duration-500 animate-tilt",
                    "animated-gradient bg-gradient-to-r",
                    "from-sky-400 via-emerald-50 to-sky-400",
                )}
            />

            {/* Video */}
            <video
                className={cx("relative z-10 w-full h-auto aspect-video object-cover rounded-xl", videoClassName)}
                src={src}
                {...videoProps}
            />

            {/* Optional overlay content */}
            {children ? (
                <div className="absolute inset-0 z-20">{children}</div>
            ) : null}
        </div>
    );
}
