import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { PageContentMap } from '@/app/[locale]/admin/behandlungen/data';

/**
 * Reads the public service-page content map for SSR (called from the locale
 * layout, handed down via PageContentProvider). Uses the anon key + the
 * public-read RLS policy on `site_page_content`. Reads `draft` when
 * CONTENT_PREVIEW=1 (local preview of unpublished admin edits), otherwise
 * `published`. Any failure — env missing, table not yet migrated, network,
 * null column (nothing published yet) — returns an empty map, so callers fall
 * back to the hardcoded INIT_PAGE_CONTENT defaults exactly like a fresh
 * browser does today and the site always renders.
 */
export async function getServerPageContent(): Promise<PageContentMap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        // Admin publishes must show up immediately, not after a CDN/browser cache window.
        fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }),
      },
    });
    const { data, error } = await sb
      .from('site_page_content')
      .select('draft, published')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return {};

    const column = process.env.CONTENT_PREVIEW === '1' ? data.draft : data.published;
    if (!column || typeof column !== 'object' || Array.isArray(column)) return {};
    return column as PageContentMap;
  } catch {
    return {};
  }
}
