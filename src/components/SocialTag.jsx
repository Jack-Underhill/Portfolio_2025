function SocialTag({ name, link, icon }) {
    return (
        <a 
            className='h-full' 
            href={link} 
            target="_blank" 
            title={`View My ${name}`}>
                <img 
                    src={icon} 
                    alt={`${name} Profile`}
                    className='h-full hover:animate-bounce' 
                />
        </a>
    )
}

export default SocialTag;