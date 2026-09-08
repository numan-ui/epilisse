import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { SiteContent } from '@/app/[locale]/admin/behandlungen/data';

/**
 * The rest of the admin CMS (services, campaigns, settings, landing copy, hero
 * slides, promo banners, about values, reviews) — DB-backed draft/publish,
 * mirrors /api/categories and /api/page-content. See
 * supabase/migrations/0022_site_content.sql and src/lib/content/site.ts.
 */

const KEYS: (keyof SiteContent)[] = [
  'services', 'aktionen', 'settings', 'landingContent',
  'heroSlides', 'aboutValues', 'reviews',
  // tolerated during the 0023 migration window — no longer written by the admin
  'campaigns', 'promoBanners',
];

function isValid(body: unknown): body is SiteContent {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  // Permissive: only reject unknown top-level keys and obviously wrong shapes;
  // the admin UI is the source of truth for field-level structure.
  return Object.keys(body as Record<string, unknown>).every((k) => KEYS.includes(k as keyof SiteContent));
}

/** `?content=draft`: admin only — seed a fresh browser's editing state from the shared draft. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('content') !== 'draft') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('site_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (error) return dbError('content', error, 500);
  return NextResponse.json({ draft: data?.draft ?? null });
}

/** Admin only — write the admin's live-edited CMS bundle into `draft`. Never touches `published`. */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValid(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from('site_content')
    .update({ draft: body, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return dbError('content', error, 500);

  return NextResponse.json({ ok: true });
}

/** Admin only — "Veröffentlichen": copies `draft` -> `published`. */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data, error: readError } = await supabase
    .from('site_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (readError) return dbError('content', readError, 500);

  const draft = (data?.draft ?? {}) as SiteContent;
  if (!isValid(draft)) {
    return NextResponse.json({ error: 'Draft ist ungültig.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('site_content')
    .update({ published: draft, published_at: now, updated_at: now })
    .eq('id', 1);
  if (error) return dbError('content', error, 500);

  return NextResponse.json({ ok: true });
}
