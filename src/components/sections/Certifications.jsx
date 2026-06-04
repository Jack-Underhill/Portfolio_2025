import CertificationCard from '../credentials/CertificationCard';
import SectionTitle from '../ui/SectionTitle';
import { resolveCredentialLogoSrc } from '../credentials/credentialLogos';

import { fetchCredentialsPublic } from '../../api/public/credentials';
import { DEFAULT_CERTIFICATIONS } from '../../domain/credentials/defaults';

import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import usePublicResource from '../../hooks/usePublicResource';
import useViewportActivationGroup from '../../hooks/useViewportActivationGroup';


function mergeCertificationCredentials(data, previous) {
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];

  return certifications.length ? certifications : previous;
}

function Certifications() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { activeId, registerItem } = useViewportActivationGroup({
    disabled: prefersReducedMotion,
  });
  const { data: certifications } = usePublicResource({
    load: fetchCredentialsPublic,
    initialData: DEFAULT_CERTIFICATIONS,
    merge: mergeCertificationCredentials,
    label: 'Certifications',
  });

  return (
    <section id="Certifications" aria-labelledby="certifications-heading" className="flex scroll-mt-28 flex-col">
      <SectionTitle id="certifications-heading" className="mb-5 md:mb-6 lg:mb-7" data-aos="flip-down">
        Certifications
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certifications.map((cert) => (
          <CertificationCard
            key={cert.id}
            ref={registerItem(cert.id)}
            isActive={activeId === cert.id}
            {...cert}
            logoSrc={resolveCredentialLogoSrc(cert)}
          />
        ))}
      </div>
    </section>
  );
}

export default Certifications;
