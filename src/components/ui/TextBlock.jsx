import SectionTitle from "./SectionTitle";
import Text from "./Text";

function TextBlock({ title, desc, titleAs = "h2", titleId }) {
    return (
        <div className='flex flex-col gap-y-7' data-aos="fade-down">
            <SectionTitle as={titleAs} id={titleId}>{title}</SectionTitle>
            <Text as="div" variant="body">
              {desc}
            </Text>
        </div>
    )
}

export default TextBlock;
