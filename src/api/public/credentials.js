import { supabasePublic } from '../clients/supabasePublic.js';
import { mapCredentialRowsToPublic } from '../../domain/credentials/mappers.js';

const CREDENTIAL_COLUMNS = [
  'id',
  'credential_kind',
  'title',
  'organization',
  'credential_type',
  'description',
  'highlights',
  'issued_label',
  'gpa',
  'credential_url',
  'logo_url',
  'logo_key',
  'logo_scale',
  'published',
  'sort_order',
].join(', ');

/**
 * Fetch public Education and Certification rows from Supabase.
 * Returns null on error / misconfig so sections can use static fallbacks.
 */
export async function fetchCredentialsPublic() {
  if (!supabasePublic) return null;

  const { data, error } = await supabasePublic
    .from('credentials')
    .select(CREDENTIAL_COLUMNS)
    .eq('published', true)
    .order('credential_kind', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('[fetchCredentialsPublic] credentials error:', error);
    return null;
  }

  return mapCredentialRowsToPublic(data);
}
