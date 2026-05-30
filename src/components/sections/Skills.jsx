import TechTag from '../tags/TechTag';
import GradientText from '../ui/GradientText';
import { fetchSkillsPublic } from '../../api/public/skills';
import { DEFAULT_SKILL_GROUPS } from '../../domain/skills/defaults';
import usePublicResource from '../../hooks/usePublicResource';

function mergeSkillGroups(data, previous) {
    const groups = Array.isArray(data?.groups) ? data.groups : [];

    return groups.length ? groups : previous;
}

function TagList({ header, tags, isSmall = false }) {
    const TagClassName = isSmall
        ? 'px-3 py-1 text-sm sm:text-base md:text-lg rounded-md bg-card-att text-text'
        : 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-text';
    const HeaderClassName = isSmall
        ? 'text-2xl font-bold text-text'
        : 'text-4xl font-bold text-text';

    return (
        <div className="flex flex-col gap-8">
            <h3 className={HeaderClassName} data-aos="flip-down">
                <GradientText>{header}</GradientText>
            </h3>
            <TechTag
                className={TagClassName}
                tags={tags}
            />
        </div>
    );
}

function Skills() {
    const { data: skillGroups } = usePublicResource({
        load: fetchSkillsPublic,
        initialData: DEFAULT_SKILL_GROUPS,
        merge: mergeSkillGroups,
        label: 'Skills',
    });

    return (
        <section
            id="Skills"
            aria-labelledby="skills-heading"
            className='grid scroll-mt-28 grid-cols-1 gap-10 md:grid-cols-2 md:gap-15 xl:grid-cols-3 xl:gap-20'
        >
            <h2 id="skills-heading" className="sr-only">Skills</h2>
            {skillGroups.map((group) => (
                <TagList
                    key={`${group.sortOrder}-${group.label}`}
                    header={group.label}
                    tags={group.items.map((item) => item.label)}
                />
            ))}
        </section>
    );
}

export default Skills;
