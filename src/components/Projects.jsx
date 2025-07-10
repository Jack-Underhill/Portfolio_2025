import projectWorkLogo from '../assets/Project_Work.png'
import projectStoreLogo from '../assets/Project_Store.png'
import projectSimLogo from '../assets/Project_PF.PNG'

import ProjectCard from './ProjectCard'
import TextBlock from './TextBlock'

function Projects() {
    return (
      <div id='Projects' className="scroll-mt-10 w-full min-h-fit flex flex-col gap-y-12 justify-center">
        
        {/* About */}
        <TextBlock
          title="About Me | Projects"
          desc="I'm a senior majoring in Computer Science at Washington State University. I enjoy building projects that combine functionality with thoughtful design - whether that's a full-stack web app, an algorithmic simulation, or a video game. The following projects best showcase my personal and school work."
        />

        {/* Cards */}
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          <ProjectCard 
            image={projectWorkLogo}
            title="This Portfolio"
            desc="Showcase of my work and skills."
            link="https://github.com/Jack-Underhill/Portfolio_2025"
            tags={[
                "Vite",
                "AOS",
                "React",
                "TailwindCSS",
                "Upstash",
                "Netlify",
            ]}
          />
      
          <ProjectCard 
            image={projectStoreLogo}
            title="University Merch Store"
            desc="Group Project building a mockup e-commerce platform."
            link="https://github.com/Jack-Underhill/Cpts489-Sp25-GroupProject-MerchStore"
            tags={[
                "Express.js",
                "React",
                "SQLite",
            ]}
          />
        
          <ProjectCard 
            image={projectSimLogo}
            title="Pathfinder Visualizer & Maze Generator"
            desc="Visualizer for different PS & MG algorithms. (In Progress)"
            link="https://pathfind-visual.netlify.app/"
            tags={[
                "Vite",
                "AOS",
                "React",
                "TailwindCSS",
                "Recharts",
                "Upstash",
                "Supabase",
                "Netlify",
            ]}
          />
        </div>
      </div>
    )
}

export default Projects;