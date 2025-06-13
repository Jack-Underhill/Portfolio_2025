function TechTag({ tags, className }) {
    return (
        <div className='flex flex-wrap gap-4'>
            {tags.map((tag) => (
                <div key={tag} className={className}>
                    {tag}
                </div>
            ))}
        </div>
    )
}

export default TechTag;