import { useEffect, useState } from 'react';

import projectWorkLogo from '../assets/Project_Work.png'
import projectStoreLogo from '../assets/Project_Store.png'
import projectSimLogo from '../assets/Project_PF.PNG'
import projectStmtLogo from '../assets/Project_Statement.PNG'
import projectDASLogo from '../assets/Project_DAS.png'

import ProjectCard from './ProjectCard'
import TextBlock from './TextBlock'
import { fetchProjectsPublic } from '../api/publicProjects'

const DEFAULT_ABOUT_PROJECTS = "I'm a senior majoring in Computer Science at Washington State University. I enjoy building projects that combine functionality with thoughtful design - whether that's a full-stack web app, an algorithmic simulation, or a video game. The following projects best showcase my personal and school work."

const DEFAULT_PROJECTS = [
  {
    id:     'das',
    image:  projectDASLogo,
    title:  'Decision Aid Systems (DAS) Modernization',
    desc:   'Capstone project to modernize an existing Laravel Blade frontend into a React + Inertia + Vite architecture.',
    link:   'https://decisionaid.systems/',
    tags:   ['React', 'Inertia.js', 'Vite', 'Bootstrap', 'Laravel', 'Docker', 'Traefik'],
  }, {
    id:     'pf',
    image:  projectSimLogo,
    title:  'Pathfinder Visualizer & Maze Generator',
    desc:   'Desktop visualizer for different PF & MG algorithms with run analytics and dragable start and end nodes.',
    link:   'https://pathfind-visual.netlify.app/',
    tags:   ['Vite', 'React', 'TailwindCSS', 'Recharts', 'Upstash', 'Supabase', 'Netlify'],
  }, {
    id:     'portfolio',
    image:  projectWorkLogo,
    title:  'This Portfolio',
    desc:   'Showcase of my work and skills.',
    link:   'https://github.com/Jack-Underhill/Portfolio_2025',
    tags:   ['Vite', 'AOS', 'React', 'TailwindCSS', 'Upstash', 'Netlify'],
  }, {
    id:     'store',
    image:  projectStoreLogo,
    title:  'University Merch Store',
    desc:   'Group Project building a mockup e-commerce platform.',
    link:   'https://github.com/Jack-Underhill/Cpts489-Sp25-GroupProject-MerchStore',
    tags:   ['Express.js', 'React', 'SQLite'],
  }, {
    id:     'statement',
    image:  projectStmtLogo,
    title:  'Statement Tracking Tool',
    desc:   'Upload and parse CSV bank statements for shared expense tracking. Useful for splitting costs 50/50 or tracking who paid.',
    link:   'https://statement-split.netlify.app/',
    tags:   ['Vite', 'React', 'TailwindCSS', 'Netlify'],
  },
];

function Projects() {
  const [aboutProjects, setAboutProjects] = useState(DEFAULT_ABOUT_PROJECTS);
  const [projects, setProjects]           = useState(DEFAULT_PROJECTS);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchProjectsPublic();
        if (!isMounted || !data) return;

        if (data.aboutProjects) {
          setAboutProjects(data.aboutProjects);
        }

        if (data.projects && data.projects.length) {
          const mapped = data.projects.map((p, idx) => ({
            id:     p.id ?? `db-${idx}`,
            image:  p.imageUrl || DEFAULT_PROJECTS[idx]?.image || projectWorkLogo,
            title:  p.title || DEFAULT_PROJECTS[idx]?.title || 'Untitled Project',
            desc:   p.description || DEFAULT_PROJECTS[idx]?.desc || '',
            link:   p.url || DEFAULT_PROJECTS[idx]?.link || '',
            tags:   p.techs && p.techs.length
                      ? p.techs
                      : DEFAULT_PROJECTS[idx]?.tags || [],
          }));
          setProjects(mapped);
        }
      } catch (err) {
        console.error('[Projects] Failed to load public projects:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div id='Projects' className="scroll-mt-10 w-full min-h-fit flex flex-col gap-y-12 justify-center">

      {/* About */}
      <TextBlock
        title = "About Me | Projects"
        desc  = {aboutProjects}
      />

      {/* Cards */}
      {/* <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'> */}
      <div className='flex flex-row flex-wrap gap-6'>
        {projects.map((p) => (
          <ProjectCard
            key   = {p.id}
            image = {p.image}
            title = {p.title}
            desc  = {p.desc}
            link  = {p.link}
            tags  = {p.tags}
          />
        ))}
      </div>
    </div>
  )
}

export default Projects;