import { supabasePublic } from '../clients/supabasePublic.js';
import { mapSkillRowsToPublic } from '../../domain/skills/mappers.js';

/**
 * Fetch public grouped Skills rows from Supabase.
 * Returns null on error / misconfig so UI can use static fallbacks.
 */
export async function fetchSkillsPublic() {
    if (!supabasePublic) return null;

    const { data, error } = await supabasePublic
        .from('skills')
        .select('group_label, label, group_sort_order, item_sort_order, published')
        .eq('published', true)
        .order('group_sort_order', { ascending: true })
        .order('group_label', { ascending: true })
        .order('item_sort_order', { ascending: true })
        .order('label', { ascending: true });

    if (error) {
        console.error('[fetchSkillsPublic] skills error:', error);
        return null;
    }

    return mapSkillRowsToPublic(data);
}
