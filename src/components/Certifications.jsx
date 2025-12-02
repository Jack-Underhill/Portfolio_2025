import CertificationTag from './CertificationTag';

const DEFAULT_CERTS = [
    {
        org: 'Microsoft',
        title: 'AZ-900',
        desc: 'Azure Fundamentals',
        link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    }, {
        org: 'Edmonds College',
        title: 'C/C++ Developer',
        desc: '',
        link: 'https://catalog.edmonds.edu/preview_program.php?catoid=63&poid=15850',
    },
];

function Certifications() {
    const TagClassName = 'px-5 py-1.5 text-xl sm:text-2xl md:text-3xl rounded-lg bg-card-att text-emerald-50'

    return (
        <div id="Certifications" className="flex flex-col gap-8">
            <div className='text-4xl font-bold text-emerald-50' data-aos="flip-down">
                Certifications
            </div>

            <div className="flex flex-col gap-4">
                {DEFAULT_CERTS.map((cert) => (
                    <div
                        key={cert}
                        className={`${TagClassName} w-fit border-2 border-card-border shadow-[inset_2px_2px_4px_#242a33,inset_-2px_-2px_4px_#3a4350]`}
                        data-aos="fade-down-right"
                    >
                        <CertificationTag 
                            org={cert.org}
                            title={cert.title}
                            desc={cert.desc}
                            link={cert.link}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Certifications;