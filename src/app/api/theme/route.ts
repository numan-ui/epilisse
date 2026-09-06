import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { Database } from '@/lib/supabase/database.types';
import { isValidHex } from '@/lib/theme/color';
import { THEME_FIELDS, type ThemeField, type ThemeInput } from '@/lib/theme/types';
import { GOLD_LUX } from '@/lib/theme/presets';

type ThemeUpdate = Database['public']['Tables']['theme_settings']['Update'];

const COLUMN: Record<ThemeField, keyof ThemeUpdate> = {
  brand: 'brand',
  onBrand: 'on_brand',
  brandHover: 'brand_hover',
  surface: 'surface',
  card: 'card',
  text: 'body_text',
  accent: 'accent',
  heroPanel: 'hero_panel',
};

type Row = {
  brand: string; on_brand: string; brand_hover: string; surface: string;
  card: string; body_text: string; accent: string; hero_panel: string;
};

function rowToInput(r: Row): ThemeInput {
  return {
    brand: r.brand, onBrand: r.on_brand, brandHover: r.brand_hover,
    surface: r.surface, card: r.card, text: r.body_text,
    accent: r.accent, heroPanel: r.hero_panel,
  };
}

/** Public — the admin editor and anything else can read the active theme. */
export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return NextResponse.json(GOLD_LUX);
    return NextResponse.json(rowToInput(data as Row));
  } catch {
    return NextResponse.json(GOLD_LUX);
  }
}

/** Admin only — replace the eight brand colours. */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<ThemeInput> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const update: ThemeUpdate = { updated_at: new Date().toISOString() };
  for (const field of THEME_FIELDS) {
    const value = body[field];
    if (!isValidHex(value)) {
      return NextResponse.json(
        { error: `"${field}" için geçersiz renk` },
        { status: 400 },
      );
    }
    update[COLUMN[field]] = value.toUpperCase();
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from('theme_settings').update(update).eq('id', 1);
  if (error) return dbError('theme', error, 500);

  return NextResponse.json({ ok: true });
}
