import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { SiteContent } from '@/app/[locale]/admin/behandlungen/data';

export type { SiteContent };

/**
 * SSR read for the public site (called from the locale layout, handed down via
 * SiteContentProvider). anon key + public-read RLS on `site_content`. Reads
 * `draft` when CONTENT_PREVIEW=1, otherwise `published`. Any failure — env
 * missing, table not yet migrated, network, null column — returns {}, so every
 * consumer hook falls back to its hardcoded INIT_* default exactly like a
 * fresh browser today and the site always renders.
 */
export async function getServerSiteContent(): Promise<SiteContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
    });
    const { data, error } = await sb
      .from('site_content')
      .select('draft, published')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return {};

    const column = process.env.CONTENT_PREVIEW === '1' ? data.draft : data.published;
    if (!column || typeof column !== 'object' || Array.isArray(column)) return {};
    return column as SiteContent;
  } catch {
    return {};
  }
}
