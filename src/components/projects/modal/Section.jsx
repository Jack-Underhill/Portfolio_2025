import GradientText from "../../ui/GradientText";
import Text from "../../ui/Text";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Section({ title, children, isSingleColumn = false }) {
    const singleColumnClass = isSingleColumn ? "md:col-span-2" : "";

    return (
        <section className={cx(singleColumnClass, "space-y-2")}>
            <Text as="h3" variant="cardTitle" className="font-bold">
                <GradientText>
                    {title}
                </GradientText>
            </Text>
            
            <Text as="div" variant="modalBody">
                {children}
            </Text>
        </section>
    );
}
