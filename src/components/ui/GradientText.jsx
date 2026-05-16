const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function GradientText({
    as: Tag = "span",
    animated = true,
    className = "",
    children,
    ...props
}) {
    return (
        <Tag
            {...props}
            className={cx(
                animated && "animated-gradient",
                "bg-gradient-to-r from-accent-soft via-text to-accent-soft text-transparent bg-clip-text",
                className
            )}
        >
            {children}
        </Tag>
    );
}
