import TechTag from './TechTag'
import SocialTag from './SocialTag'

import LinkedInIcon from '../assets/linkedin.svg'
import GitHubIcon from '../assets/github.svg'
import FiverrIcon from '../assets/fiverr.svg'
import UpWorkIcon from '../assets/upwork.svg'

let TagClassName = 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-emerald-50'

function Contact() {
    return (
      <div className="w-full min-h-fit lg:pt-60 flex flex-col gap-20 justify-center">
        <div className='flex flex-col gap-8'>
          <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
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
        </div>

        <div className='flex flex-col gap-8'>
          <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
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
        </div>

        <div className='flex flex-col gap-8'>
          <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
            Contact Me
          </div>
          <div className='h-20 flex flex-wrap gap-4'>
            <SocialTag 
              name="LinkedIn"
              link="https://www.linkedin.com/in/underhill-jack"
              icon={LinkedInIcon}
            />
            <SocialTag 
              name="GitHub"
              link="https://github.com/Jack-Underhill"
              icon={GitHubIcon}
            />
            <SocialTag 
              name="Fiverr"
              link="https://www.fiverr.com/s/P2NGy4p"
              icon={FiverrIcon}
            />
            <SocialTag 
              name="UpWork"
              link="https://www.upwork.com/freelancers/~0127c25c7f113de8cd?mp_source=share"
              icon={UpWorkIcon}
            />
          </div>
        </div>
      </div>
    )
}

export default Contact;