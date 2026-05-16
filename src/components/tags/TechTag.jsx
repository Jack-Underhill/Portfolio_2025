import GradientText from "../ui/GradientText";

function TechTag({ tags, className }) {
    return (
        <div className='flex flex-wrap gap-4'>
            {tags.map((tag) => (
                <div 
                    key={tag} 
                    className={`${className} border-2 border-card-border shadow-tag-inset`}
                    data-aos="fade-down-right"
                >
                    <GradientText>{tag}</GradientText>
                </div>
            ))}
        </div>
    )
}

export default TechTag;
