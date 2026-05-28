import TextBlock from '../ui/TextBlock'
import { fetchProjectSectionPublic } from '../../api/public/projects';
import usePublicResource from '../../hooks/usePublicResource';

const DEFAULT_ABOUT_PROJECTS =
    "I'm a senior majoring in Computer Science at Washington State University. I enjoy building projects that combine functionality with thoughtful design - whether that's a full-stack web app, an algorithmic simulation, or a video game. The following projects best showcase my personal and school work.";

function mergeAboutProjectsSection(data, previous) {
    return data.aboutProjects || previous;
}

function About() {
    const { data: aboutProjects } = usePublicResource({
        load: fetchProjectSectionPublic,
        initialData: DEFAULT_ABOUT_PROJECTS,
        merge: mergeAboutProjectsSection,
        label: 'About',
    });

    return (
        <section id="About" aria-labelledby="about-heading" className="max-w-5xl">
            <TextBlock titleId="about-heading" title="About Me" desc={aboutProjects} />
        </section>
    );
}

export default About;
