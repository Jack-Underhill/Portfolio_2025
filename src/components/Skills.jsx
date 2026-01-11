import TechTag   from './TechTag'

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

function TagList({ header, tags, isSmall = false }) {
    const TagClassName = isSmall
        ? 'px-3 py-1 text-sm sm:text-base md:text-lg rounded-md bg-card-att text-emerald-50'
        : 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-emerald-50';
    const HeaderClassName = isSmall
        ? 'text-2xl font-bold text-emerald-50'
        : 'text-4xl font-bold text-emerald-50';

    return (
        <div className="flex flex-col gap-8">
            <div className={HeaderClassName} data-aos="flip-down">
                {header}
            </div>
            <TechTag
                className={TagClassName}
                tags={tags}
            />
        </div>
    );
}

function Skills() {
    return (
        <div
            id="Skills"
            className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-15 xl:gap-20'
        >
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
        </div>
    );
}

export default Skills;
