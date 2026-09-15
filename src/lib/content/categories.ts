import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

// Pure reconciliation rule (built-in fill/inject/drop) lives in its own module
// so the client paths (useAdminCategories / AdminDataContext) can import it
// without pulling in this server-only file.
import { mergeCategories } from '@/lib/content/mergeCategories';
export { mergeCategories };

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
        // Revalidated every 60s (Next.js data cache) rather than no-store: every
        // page request was paying a live Supabase round-trip, which was the
        // dominant cost in a ~1.5-2.5s TTFB. Admin publishes now appear within
        // 60s instead of instantly — acceptable tradeoff for the TTFB win.
        fetch: (u, o) => fetch(u, { ...o, cache: undefined, next: { revalidate: 60 } }),
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
