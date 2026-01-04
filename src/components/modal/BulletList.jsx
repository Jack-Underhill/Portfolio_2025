const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function BulletList({
    textArray,

    // Outter div styling
    className = "",

    // spacing between list items (space-y-*)
    itemSpacingClassName = "space-y-2",

    // text styling
    textClassName = "",

    // line-to-line spacing inside each li (leading-*)
    lineSpacingClassName = "leading-normal",
}) {
    return (
        <ul className={cx("list-disc ml-2.5 pl-5", itemSpacingClassName, className)}>
            {textArray.map((x, idx) => (
                <li 
                    key={`imp-${idx}`}
                    className={cx(textClassName, lineSpacingClassName)}
                >
                    {x}
                </li>
            ))}
        </ul>
    );
}
