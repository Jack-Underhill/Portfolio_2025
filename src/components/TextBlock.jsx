function TextBlock({ title, desc }) {
    return (
        <div className='flex flex-col gap-y-7'>
            <div className='text-4xl font-bold text-emerald-50'>
              {title}
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              {desc}
            </div>
        </div>
    )
}

export default TextBlock;