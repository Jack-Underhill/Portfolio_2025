import CertificationCard from './CertificationCard';
import MicrosoftLogo from '../assets/logos/microsoft-logo.svg';
import UniLogo from '../assets/logos/uni-logo.svg';

const DEFAULT_CERTS = [
    {
        title: 'Azure Fundamentals',
        org: 'Microsoft',
        link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
        desc: 'Cloud fundamentals, Azure services, networking basics, pricing, identity & security basics.',
        chips: ['Cloud', 'Azure', 'Security', 'Networking'],
        issued: '2025',
        credentialType: 'Certification',
        logoSrc: MicrosoftLogo,
    }, {
        title: 'C/C++ Developer',
        org: 'Edmonds College',
        link: 'https://catalog.edmonds.edu/preview_program.php?catoid=63&poid=15850',
        desc: 'Low-level programming, memory management, data structures, algorithms.',
        chips: ['C/C++', 'Memory', 'Algorithms', 'Data Structures'],
        issued: '2022',
        credentialType: 'Certificate',
        logoSrc: UniLogo,
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