import TechTag from './TechTag'

let TagClassName = 'px-5 py-1.5 text-3xl rounded-lg bg-card-att text-emerald-50'
SS
function Contact() {
    return (
      <div className="w-full  h-[calc(100vh-6rem)] flex flex-col gap-y-12 justify-center">
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
        <div className='text-xl font-semibold text-emerald-50'>
          jackmaierunderhill@gmail.com
        </div>
      </div>
    )
}

export default Contact;