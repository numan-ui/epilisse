import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { ThemeInput } from './types';
import { GOLD_LUX } from './presets';

type Row = Database['public']['Tables']['theme_settings']['Row'];

function rowToInput(r: Row): ThemeInput {
  return {
    brand: r.brand,
    onBrand: r.on_brand,
    brandHover: r.brand_hover,
    surface: r.surface,
    card: r.card,
    text: r.body_text,
    accent: r.accent,
    heroPanel: r.hero_panel,
  };
}

/**
 * Reads the live theme for SSR (called from the locale layout). Uses the anon
 * key + the public-read RLS policy. Any failure — env missing, table not yet
 * migrated, network — falls back to the Gold Lux preset, which matches
 * globals.css, so the site always renders.
 */
export async function getServerTheme(): Promise<ThemeInput> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return GOLD_LUX;

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        // Theme changes must show up immediately after an admin save.
        fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }),
      },
    });
    const { data, error } = await sb
      .from('theme_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return GOLD_LUX;
    return rowToInput(data);
  } catch {
    return GOLD_LUX;
  }
}
