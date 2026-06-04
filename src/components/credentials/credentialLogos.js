import WSULogo from '../../assets/logos/wsu.svg';
import EDCCLogo from '../../assets/logos/edcc.svg';
import MicrosoftLogo from '../../assets/logos/microsoft-logo.svg';

const LOGOS_BY_KEY = {
  edcc: EDCCLogo,
  microsoft: MicrosoftLogo,
  wsu: WSULogo,
};

export function resolveCredentialLogoSrc(credential) {
  const logoUrl = typeof credential?.logoUrl === 'string' ? credential.logoUrl.trim() : '';
  if (logoUrl) return logoUrl;

  const logoKey = typeof credential?.logoKey === 'string' ? credential.logoKey.trim().toLowerCase() : '';
  return LOGOS_BY_KEY[logoKey] ?? null;
}
