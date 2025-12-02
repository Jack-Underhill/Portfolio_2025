function CertificationTag({ org, title, desc, link }) {
    return (
        <a
            className='h-full' 
            href={link} 
            target="_blank" 
            title={`View My ${title}`} 
        >
            {org}
            {': '}
            
            <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">{title}</span>
            
            {desc ? ' | ' : ''}
            {desc}
        </a>
    )
}

export default CertificationTag;