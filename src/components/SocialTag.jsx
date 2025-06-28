function SocialTag({ name, link, icon }) {
    return (
        <div className="h-20" data-aos="fade-down-right">
            <a 
                className='h-full' 
                href={link} 
                target="_blank" 
                title={`View My ${name}`}
            >
                <img 
                    src={icon} 
                    alt={`${name} Profile`}
                    className='h-full hover:animate-bounce' 
                />
            </a>
        </div>
    )
}

export default SocialTag;