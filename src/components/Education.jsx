import EducationCard from './EducationCard';
import UniLogo from '../assets/logos/uni-logo.svg';

const DEFAULT_EDUCATION = [
    {
        id: 'wsu-bs-cs',
        title: 'B.S. in Computer Science',
        org: 'Washington State University',
        link: 'https://school.eecs.wsu.edu/academics/undergraduate-program/computer-science/',
        desc: 'Rigorous curriculum grounded in math and systems, covering software design, data structures & algorithms, programming languages, data management, and a culminating senior capstone.',
        chips: ['Software Engineering', 'Algorithms', 'Data Structures', 'Databases', 'Systems & Theory'],
        issued: '2024–2026 • Expected',
        credentialType: "Bachelor’s Degree",
        gpa: "3.52",
        logoSrc: UniLogo,
    },
    {
        id: 'wsu-math-minor',
        title: 'Minor in Mathematics',
        org: 'Washington State University',
        link: 'https://math.wsu.edu/undergraduate-studies/minors/',
        desc: 'Proof-focused foundation that strengthens analytical reasoning, abstraction, and mathematical modeling for CS problem solving.',
        chips: ['Calculus', 'Differential Equations', 'Graph Theory', 'Discrete Math', 'Linear Algebra', 'Probability'],
        issued: '2024–2026 • Expected',
        credentialType: 'Minor',
        gpa: "",
        logoSrc: UniLogo,
    },
    {
        id: 'edmonds-ast',
        title: 'Associate in Science–Transfer (AS-T)',
        org: 'Edmonds Community College',
        link: 'https://catalog.edmonds.edu/preview_program.php?catoid=53&poid=10672',
        desc: 'Transfer pathway for engineering and CS, building a strong math/physics foundation and practical programming skills for upper-division work.',
        chips: ['Computer Science', 'Physics', 'Calculus', 'Engineering'],
        issued: '2019–2022',
        credentialType: 'Associate Degree',
        gpa: "",
        logoSrc: UniLogo,
    },
];

function Education() {
    return (
        <div id="Education" className="flex flex-col gap-8">
            <div className="text-4xl font-bold text-emerald-50" data-aos="flip-down">
                Education
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {DEFAULT_EDUCATION.map((edu) => (
                    <EducationCard key={edu.id} {...edu} />
                ))}
            </div>
        </div>
    );
}

export default Education;
