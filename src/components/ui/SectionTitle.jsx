import GradientText from "./GradientText";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function SectionTitle({
    as: Tag = "h2",
    animated = true,
    className = "",
    children,
    ...props
}) {
    return (
        <Tag
            {...props}
            className={cx("text-4xl font-bold text-text", className)}
        >
            <GradientText animated={animated}>{children}</GradientText>
        </Tag>
    );
}
