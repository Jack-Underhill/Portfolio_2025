import CertificationCard from './CertificationCard';
import MicrosoftLogo from '../assets/logos/microsoft-logo.svg';
import EDCCLogo from '../assets/logos/edcc.svg';

const DEFAULT_CERTS = [
    {
        title: 'Azure Fundamentals',
        org: 'Microsoft',
        link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
        desc: 'Core Azure and cloud fundamentals (compute, storage, networking, identity, security, and pricing), enough to reason about cloud architectures and tradeoffs.',
        chips: ['Cloud Concepts', 'Azure Services', 'Security & Identity', 'Governance', 'Pricing & Support'],
        issued: '2025',
        credentialType: 'Certification',
        logoSrc: MicrosoftLogo,
        logoScale: 0.62,
    }, {
        title: 'C/C++ Developer',
        org: 'Edmonds College',
        link: 'https://catalog.edmonds.edu/preview_program.php?catoid=63&poid=15850',
        desc: 'C/C++ core sequence covering procedural fundamentals, object-oriented design, algorithm efficiency, and core data structures using the C++ Standard Library.',
        chips: ['C/C++', 'Pointers & Recursion', 'Object-Oriented', 'Data Structures', 'Complexity (Big-O)'],
        issued: '2022',
        credentialType: 'Certificate',
        logoSrc: EDCCLogo,
        logoScale: 0.65,
    },
];

function Certifications() {
    return (
        <section id="Certifications" className="flex flex-col gap-6">
            <h2 className="text-4xl font-bold text-emerald-50" data-aos="flip-down">
                Certifications
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {DEFAULT_CERTS.map((cert) => (
                    <CertificationCard
                        key={cert.title}
                        {...cert}
                    />
                ))}
            </div>
        </section>
    );
}

export default Certifications;