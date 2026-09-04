import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

/**
 * Reconciles a stored category list against the code defaults: drops stale
 * entries for built-in categories no longer in code (e.g. a removed default
 * category), and fills any blank admin field on a built-in category from its
 * code default. Admin-created ('cat-') categories pass through unchanged —
 * there's no default to fall back to. Shared by the client localStorage path
 * ([[useAdminCategories]]) and the server DB path (getServerCategories below)
 * so both apply the exact same rule.
 */
export function mergeCategories(stored: Category[]): Category[] {
  return stored
    .filter(c => CATEGORIES.some(d => d.id === c.id) || c.id.startsWith('cat-'))
    .map(c => {
      const def = CATEGORIES.find(d => d.id === c.id);
      if (!def) return c;
      // image is intentionally not force-defaulted here: empty means "use the built-in photo", a valid state (see usage site fallback)
      return { id: c.id, icon: str(c.icon, def.icon), name: str(c.name, def.name), desc: str(c.desc, def.desc), visible: c.visible, image: c.image ?? '', kicker: str(c.kicker, def.kicker) };
    });
}

/**
 * Reads the public category list for SSR (called from the locale layout).
 * Uses the anon key + the public-read RLS policy on `site_categories_content`.
 * Reads `draft` when CONTENT_PREVIEW=1 (local preview of unpublished admin
 * edits), otherwise `published`. Any failure — env missing, table not yet
 * migrated, network, null column (nothing saved/published yet) — falls back
 * to the hardcoded CATEGORIES defaults, identical to today's fresh-browser
 * behaviour, so the site always renders.
 */
export async function getServerCategories(): Promise<Category[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return CATEGORIES;

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        // Admin publishes must show up immediately, not after a CDN/browser cache window.
        fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }),
      },
    });
    const { data, error } = await sb
      .from('site_categories_content')
      .select('draft, published')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return CATEGORIES;

    const column = process.env.CONTENT_PREVIEW === '1' ? data.draft : data.published;
    if (!column || !Array.isArray(column) || column.length === 0) return CATEGORIES;
    return mergeCategories(column as Category[]);
  } catch {
    return CATEGORIES;
  }
}
