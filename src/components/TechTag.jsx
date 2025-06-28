function TechTag({ tags, className }) {
    return (
        <div className='flex flex-wrap gap-4'>
            {tags.map((tag) => (
                <div 
                    key={tag} 
                    className={`${className} border-2 border-card-border shadow-[inset_2px_2px_4px_#242a33,inset_-2px_-2px_4px_#3a4350]`}
                    data-aos="fade-down-right"
                >
                    <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">{tag}</span>
                </div>
            ))}
        </div>
    )
}

export default TechTag;