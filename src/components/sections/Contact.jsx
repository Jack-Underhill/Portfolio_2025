import SocialTag from '../tags/SocialTag'
import SectionTitle from '../ui/SectionTitle'

import LinkedInIcon  from '../../assets/linkedin.svg'
import GitHubIcon    from '../../assets/github.svg'
import FiverrIcon    from '../../assets/fiverr.svg'
import UpWorkIcon    from '../../assets/upwork.svg'
import HandshakeIcon from '../../assets/handshake.svg'

import { fetchContactPublic } from '../../api/public/contact';
import usePublicResource from '../../hooks/usePublicResource';

const DEFAULT_LINKS = [
  {
    id:   'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/underhill-jack',
    icon: LinkedInIcon,
  },
  {
    id:   'github',
    name: 'GitHub',
    href: 'https://github.com/Jack-Underhill',
    icon: GitHubIcon,
  },
  {
    id:   'fiverr',
    name: 'Fiverr',
    href: 'https://www.fiverr.com/s/P2NGy4p',
    icon: FiverrIcon,
  },
  {
    id:   'upwork',
    name: 'UpWork',
    href: 'https://www.upwork.com/freelancers/~0127c25c7f113de8cd?mp_source=share',
    icon: UpWorkIcon,
  },
  {
    id:   'handshake',
    name: 'Handshake',
    href: 'https://wsu.joinhandshake.com/profiles/hm4hrh',
    icon: HandshakeIcon,
  },
];

function mergeContactLinks(data, previous) {
  if (!Array.isArray(data.links) || !data.links.length) return previous;

  const mapped = data.links
    .map((row, idx) => {
      const label = row.label || row.platform || DEFAULT_LINKS[idx]?.name || `Link ${idx + 1}`;
      const href  = row.url   || DEFAULT_LINKS[idx]?.href  || '#';

      const icon =
        row.iconUrl ||
        DEFAULT_LINKS[idx]?.icon ||
        LinkedInIcon;

      return {
        id:   row.id ?? `link-${idx}`,
        name: label,
        href,
        icon,
      };
    })
    .filter((link) => link.href && link.href !== '#');

  return mapped.length ? mapped : previous;
}

function Contact() {
  const { data: links } = usePublicResource({
    load: fetchContactPublic,
    initialData: DEFAULT_LINKS,
    merge: mergeContactLinks,
    label: 'Contact',
  });

  return (
    <section id='Contact' aria-labelledby="contact-heading" className='scroll-mt-10 flex flex-col gap-8'>
      {/* Header */}
      <SectionTitle id="contact-heading" data-aos="flip-down">
        Contact Me
      </SectionTitle>
      {/* List */}
      <div className='h-20 flex flex-wrap gap-4'>
        {links.map((link) => (
          <SocialTag
            key  = {link.id}
            name = {link.name}
            link = {link.href}
            icon = {link.icon}
          />
        ))}
      </div>
    </section>
  )
}

export default Contact;
