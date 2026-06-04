import EducationCard from '../credentials/EducationCard';
import SectionTitle from '../ui/SectionTitle';
import { resolveCredentialLogoSrc } from '../credentials/credentialLogos';

import { fetchCredentialsPublic } from '../../api/public/credentials';
import { DEFAULT_EDUCATION } from '../../domain/credentials/defaults';

import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import usePublicResource from '../../hooks/usePublicResource';
import useViewportActivationGroup from '../../hooks/useViewportActivationGroup';


function mergeEducationCredentials(data, previous) {
  const education = Array.isArray(data?.education) ? data.education : [];

  return education.length ? education : previous;
}

function Education() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { activeId, registerItem } = useViewportActivationGroup({
    disabled: prefersReducedMotion,
  });
  const { data: education } = usePublicResource({
    load: fetchCredentialsPublic,
    initialData: DEFAULT_EDUCATION,
    merge: mergeEducationCredentials,
    label: 'Education',
  });

  return (
    <section id="Education" aria-labelledby="education-heading" className="flex scroll-mt-28 flex-col">
      <SectionTitle id="education-heading" className="mb-5 md:mb-6 lg:mb-7" data-aos="flip-down">
        Education
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {education.map((edu) => (
          <EducationCard
            key={edu.id}
            ref={registerItem(edu.id)}
            isActive={activeId === edu.id}
            {...edu}
            logoSrc={resolveCredentialLogoSrc(edu)}
          />
        ))}
      </div>
    </section>
  );
}

export default Education;
