import SectionTitle from "./SectionTitle";
import Text from "./Text";

function TextBlock({ title, desc }) {
    return (
        <div className='flex flex-col gap-y-7' data-aos="fade-down">
            <SectionTitle as="div">{title}</SectionTitle>
            <Text as="div" variant="body">
              {desc}
            </Text>
        </div>
    )
}

export default TextBlock;
