import { useEffect, useState } from 'react';

import TechTag   from './TechTag'
import SocialTag from './SocialTag'
import Education from './Education'
import Certifications from './Certifications'

import LinkedInIcon  from '../assets/linkedin.svg'
import GitHubIcon    from '../assets/github.svg'
import FiverrIcon    from '../assets/fiverr.svg'
import UpWorkIcon    from '../assets/upwork.svg'
import HandshakeIcon from '../assets/handshake.svg'

import { fetchContactPublic } from '../api/publicContact';

let TagClassName = 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-emerald-50'

const DEFAULT_LANGUAGES = [
  'Java',
  'C++',
  'JavaScript',
  'C#',
];

const DEFAULT_EXPERIENCE = [
  'C',
  'Python',
  'React',
  'HTML',
  'CSS',
  'Node.js',
  'Express.js',
  'Vite',
  'TailwindCSS',
  'Recharts',
  'MySQL',
  'SQLite',
  'Upstash',
  'Supabase',
];

const DEFAULT_LINKS = [
  {
    id:   'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/underhill-jack',
    icon: LinkedInIcon,
  },
  {
    id:   'github',
    name: 'GitHub',
    href: 'https://github.com/Jack-Underhill',
    icon: GitHubIcon,
  },
  {
    id:   'fiverr',
    name: 'Fiverr',
    href: 'https://www.fiverr.com/s/P2NGy4p',
    icon: FiverrIcon,
  },
  {
    id:   'upwork',
    name: 'UpWork',
    href: 'https://www.upwork.com/freelancers/~0127c25c7f113de8cd?mp_source=share',
    icon: UpWorkIcon,
  },
  {
    id:   'handshake',
    name: 'Handshake',
    href: 'https://wsu.joinhandshake.com/profiles/hm4hrh',
    icon: HandshakeIcon,
  },
];

function Contact() {
  const [languages, setLanguages]   = useState(DEFAULT_LANGUAGES);
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [links, setLinks]           = useState(DEFAULT_LINKS);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchContactPublic();
        if (!isMounted || !data) return;

        if (Array.isArray(data.languages) && data.languages.length) {
          setLanguages(data.languages);
        }

        if (Array.isArray(data.experience) && data.experience.length) {
          setExperience(data.experience);
        }

        if (Array.isArray(data.links) && data.links.length) {
          const mapped = data.links
            .map((row, idx) => {
              const label = row.label || row.platform || DEFAULT_LINKS[idx]?.name || `Link ${idx + 1}`;
              const href  = row.url   || DEFAULT_LINKS[idx]?.href  || '#';

              const icon =
                row.iconUrl ||
                DEFAULT_LINKS[idx]?.icon ||
                LinkedInIcon;

              return {
                id:   row.id ?? `link-${idx}`,
                name: label,
                href,
                icon,
              };
            })
            .filter((l) => l.href && l.href !== '#');

          if (mapped.length) {
            setLinks(mapped);
          }
        }
      } catch (err) {
        console.error('[Contact] Failed to load public contact data:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function TagList({ header, tags }) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
          {header}
        </div>
        <TechTag
            className = {TagClassName}
            tags      = {tags}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-fit lg:pt-60 flex flex-col gap-20 justify-center">
      <Education />
      <Certifications />

      {/* <div className='flex flex-col gap-8'>
        <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
          Proficient Languages
        </div>
        <TechTag
            className = {TagClassName}
            tags      = {languages}
        />
      </div>

      <div className='flex flex-col gap-8'>
        <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
          Experience Using
        </div>
        <TechTag
            className = {TagClassName}
            tags      = {experience}
        />
      </div> */}

      <TagList 
        header="Core Web Stack" 
        tags={[
          'JavaScript',
          'React',
          'TailwindCSS',
          'Vite',
          'Netlify',
        ]} 
      />
      <TagList 
        header="Backend" 
        tags={[
          'Node',
          'Express',
        ]} 
      />
      <TagList 
        header="Data" 
        tags={[
          'Supabase (Postgres)',
          'Upstash (Redis)',
          'SQLite',
          'MySQL',
        ]} 
      />
      <TagList 
        header="Infra & Tooling" 
        tags={[
          'Git',
          'GitHub',
          'Azure',
          'Docker',
          'Traefik',
        ]} 
        />
      <TagList 
        header="Languages" 
        tags={[
          'C++',
          'Java',
          'Python',
          'C#',
          'C',
        ]} 
        />
      <TagList 
        header="Also Built With" 
        tags={[
          'Bootstrap',
          'AOS',
          'Recharts',
          'Unity',
        ]} 
      />

      <div id='Contact' className='scroll-mt-10 flex flex-col gap-8'>
        <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
          Contact Me
        </div>
        <div className='h-20 flex flex-wrap gap-4'>
          {links.map((link) => (
            <SocialTag
              key  = {link.id}
              name = {link.name}
              link = {link.href}
              icon = {link.icon}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Contact;