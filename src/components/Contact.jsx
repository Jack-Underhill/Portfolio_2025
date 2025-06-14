import TechTag from './TechTag'

let TagClassName = 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-emerald-50'

function Contact() {
    return (
      <div className="w-full min-h-screen flex flex-col gap-y-12 justify-center">
        <div className='text-4xl font-bold text-emerald-50'>
          Proficient Languages
        </div>
        <TechTag
            className={TagClassName}
            tags={[
                "Java",
                "C++",
                "JavaScript",
                "C#",
            ]}
        />

        <div className='text-4xl font-bold text-emerald-50'>
          Experience Using
        </div>
        <TechTag
            className={TagClassName}
            tags={[
                "C",
                "Python",
                "TailwindCSS",
                "React",
                "MySQL",
                "SQLite",
                "HTML",
                "CSS",
                "Node.js",
                "Express.js",
            ]}
        />
        
        <div className='text-4xl font-bold text-emerald-50'>
          Contact Me
        </div>
        <a href='mailto:jackmaierunderhill@gmail.com'
          className='text-xl font-semibold text-emerald-50 underline hover:text-sky-400 transition'>
          jackmaierunderhill@gmail.com
        </a>
      </div>
    )
}

export default Contact;