import { useEffect, useState } from 'react';
import TextBlock from './TextBlock'
import { fetchProjectSectionPublic } from '../api/publicProjects';

const DEFAULT_ABOUT_PROJECTS =
    "I'm a senior majoring in Computer Science at Washington State University. I enjoy building projects that combine functionality with thoughtful design - whether that's a full-stack web app, an algorithmic simulation, or a video game. The following projects best showcase my personal and school work.";


function About() {
    const [aboutProjects, setAboutProjects] = useState(DEFAULT_ABOUT_PROJECTS);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchProjectSectionPublic();
                if (!data) return;

                if (data.aboutProjects) setAboutProjects(data.aboutProjects);
            } catch (err) {
                console.error('[About] Failed to load text:', err);
            }
        })();
    }, []);

    return (
        <div id="About" className="">
            <TextBlock title="About Me" desc={aboutProjects} />
        </div>
    );
}

export default About;
