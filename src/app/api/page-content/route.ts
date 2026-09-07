import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { PageContent, PageContentMap, PageBanner } from '@/app/[locale]/admin/behandlungen/data';

/**
 * Service-page content (Seiteninhalt) — DB-backed draft/publish, mirrors
 * /api/categories. Admin edits write `draft`; the public site reads
 * `published` (or `draft` on a CONTENT_PREVIEW=1 dev server). See
 * supabase/migrations/0021_page_content.sql and src/lib/content/pageContent.ts.
 */

/**
 * `?content=draft`: admin only — returns the current `draft` column of
 * `site_page_content`, so a browser whose localStorage doesn't have the
 * admin's edited page content yet (new device, cleared site data, incognito)
 * can seed its editing state from the real shared draft instead of the
 * hardcoded INIT_PAGE_CONTENT defaults, then clobbering the shared draft with
 * those via the debounced write-through in AdminDataContext.
 */
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
    .from('site_page_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (error) return dbError('page-content', error, 500);
  return NextResponse.json({ draft: data?.draft ?? null });
}

function isBanner(b: unknown): b is PageBanner {
  if (!b || typeof b !== 'object') return false;
  const x = b as Record<string, unknown>;
  return ['label', 'title', 'body', 'cta', 'icon', 'image'].every((k) => typeof x[k] === 'string');
}

function isPageContent(v: unknown): v is PageContent {
  if (!v || typeof v !== 'object') return false;
  const x = v as Record<string, unknown>;
  return (
    typeof x.label === 'string' &&
    typeof x.h1 === 'string' &&
    typeof x.heroDesc === 'string' &&
    typeof x.heroImage === 'string' &&
    typeof x.infoTitle === 'string' &&
    Array.isArray(x.infoParagraphs) && x.infoParagraphs.length === 2 &&
    x.infoParagraphs.every((p) => typeof p === 'string') &&
    typeof x.benefitsTitle === 'string' &&
    Array.isArray(x.benefits) && x.benefits.every((b) => typeof b === 'string') &&
    isBanner(x.campaign1) && isBanner(x.campaign2)
  );
}

function isValidMap(body: unknown): body is PageContentMap {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  return Object.values(body as Record<string, unknown>).every(isPageContent);
}

/** Admin only — write the admin's live-edited page-content map into `draft`. Never touches `published`. */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidMap(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from('site_page_content')
    .update({ draft: body, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return dbError('page-content', error, 500);

  return NextResponse.json({ ok: true });
}

/** Admin only — "Veröffentlichen": copies `draft` -> `published`. */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data, error: readError } = await supabase
    .from('site_page_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (readError) return dbError('page-content', readError, 500);

  const draft = (data?.draft ?? {}) as PageContentMap;
  if (!isValidMap(draft)) {
    return NextResponse.json({ error: 'Draft ist ungültig.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('site_page_content')
    .update({ published: draft, published_at: now, updated_at: now })
    .eq('id', 1);
  if (error) return dbError('page-content', error, 500);

  return NextResponse.json({ ok: true });
}
