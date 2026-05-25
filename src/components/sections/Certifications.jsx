import CertificationCard from '../credentials/CertificationCard';
import SectionTitle from '../ui/SectionTitle';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import useViewportActivationGroup from '../../hooks/useViewportActivationGroup';
import MicrosoftLogo from '../../assets/logos/microsoft-logo.svg';
import EDCCLogo from '../../assets/logos/edcc.svg';

const DEFAULT_CERTS = [
    {
        id: 'microsoft-azure-fundamentals',
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
        id: 'edmonds-c-cpp-developer',
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
    const prefersReducedMotion = usePrefersReducedMotion();
    const { activeId, registerItem } = useViewportActivationGroup({
        disabled: prefersReducedMotion,
    });

    return (
        <section id="Certifications" aria-labelledby="certifications-heading" className="flex flex-col gap-6">
            <SectionTitle id="certifications-heading" data-aos="flip-down">
                Certifications
            </SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {DEFAULT_CERTS.map((cert) => (
                    <CertificationCard
                        key={cert.id}
                        ref={registerItem(cert.id)}
                        isActive={activeId === cert.id}
                        {...cert}
                    />
                ))}
            </div>
        </section>
    );
}

export default Certifications;
