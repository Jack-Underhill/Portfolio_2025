import SectionTitle from "./SectionTitle";
import Text from "./Text";

function TextBlock({ title, desc, titleAs = "h2", titleId }) {
    const paragraphs = String(desc || '')
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <div className='flex flex-col gap-y-4 md:gap-y-5 lg:gap-y-7' data-aos="fade-down">
            <SectionTitle as={titleAs} id={titleId}>{title}</SectionTitle>
            <Text as="div" variant="body">
                {paragraphs.map((paragraph, index) => (
                    <span key={index} className="block  mb-4.5 md:mb-7 lg:mb-8 last:mb-0">
                        {paragraph}
                    </span>
                ))}
            </Text>
        </div>
    )
}

export default TextBlock;
