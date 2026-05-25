import { forwardRef } from "react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const CardSurface = forwardRef(function CardSurface({
    link,
    title,
    isActive = false,
    isPremiumSheenActive = false,

    className = "",
    children,
    ...props
}, ref) {
    const hasLink = Boolean(link);
    const Tag = hasLink ? "a" : "div";
    const linkProps = hasLink
        ? {
            href: link,
            target: "_blank",
            rel: "noreferrer noopener",
            title: `${title}`,
            "aria-label": `${title}`,
        }
        : {};

    return (
        <Tag
            ref={ref}
            {...linkProps}
            {...props}
            data-card-active={isActive ? "true" : undefined}
            className={cx(
                "group relative rounded-xl border-2 border-card-border bg-card",
                "shadow-card-inset",
                className
            )}
        >
            {Boolean(isPremiumSheenActive) && (
                <>
                    {/* premium sheen (tinted) */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-accent-soft/10 blur-3xl opacity-25" />
                    <div
                        className={cx(
                            "surface-sheen-radial pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
                            isActive ? "opacity-100" : "opacity-0"
                        )}
                    />
                </>
            )}

            {children}
        </Tag>
    );
});

export default CardSurface;
