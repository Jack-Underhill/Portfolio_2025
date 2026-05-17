import GradientText from "./GradientText";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function SectionTitle({
    as = "h2",
    animated = true,
    className = "",
    children,
    ...props
}) {
    const Component = as;

    return (
        <Component
            {...props}
            className={cx("text-4xl font-bold text-text", className)}
        >
            <GradientText animated={animated}>{children}</GradientText>
        </Component>
    );
}
