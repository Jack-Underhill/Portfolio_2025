function TextBlock({ title, desc }) {
    return (
        <div className='flex flex-col gap-y-7' data-aos="fade-down">
            <div className='text-4xl font-bold text-emerald-50'>
              <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">{title}</span>
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              {desc}
            </div>
        </div>
    )
}

export default TextBlock;