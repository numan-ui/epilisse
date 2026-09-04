import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { Category } from '@/app/[locale]/admin/behandlungen/data';

/**
 * Default (no query param): used by admin/termine + admin/kampagnen for category
 * dropdowns — the CRM `categories` table (id/name), unrelated to draft/published
 * content below.
 *
 * `?content=draft`: admin only — returns the current `draft` column of
 * `site_categories_content`, so a browser whose localStorage doesn't have the
 * admin's edited category list yet (new device, cleared site data, incognito)
 * can seed its editing state from the real shared draft instead of falling
 * back to the hardcoded CATEGORIES defaults and then, via the debounced
 * write-through in AdminDataContext, clobbering that shared draft with them.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('content') === 'draft') {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('site_categories_content')
      .select('draft')
      .eq('id', 1)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ draft: data?.draft ?? null });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.from('categories').select('id, name').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

function isValidCategories(body: unknown): body is Category[] {
  return Array.isArray(body) && body.every((c) =>
    c && typeof c === 'object' &&
    typeof (c as Category).id === 'string' &&
    typeof (c as Category).name === 'string' &&
    typeof (c as Category).icon === 'string' &&
    typeof (c as Category).desc === 'string' &&
    typeof (c as Category).kicker === 'string' &&
    typeof (c as Category).visible === 'boolean' &&
    typeof (c as Category).image === 'string'
  );
}

/** Admin only — write the admin's live-edited category list into `draft`. Never touches `published`. */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidCategories(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from('site_categories_content')
    .update({ draft: body, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/**
 * Admin only — "Veröffentlichen": copies `draft` -> `published`. Also upserts a
 * {id, name} row into the CRM `categories` table for every category not
 * already there, so a booking against a newly-published admin-created
 * category can never FK-fail (see src/app/api/book/route.ts, which does the
 * same defensive upsert for the reverse case — a booking arriving before a
 * publish ever happens). Never deletes rows there: old categories may still
 * be referenced by past appointments.
 */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data, error: readError } = await supabase
    .from('site_categories_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const draft = (data?.draft as Category[] | null) ?? [];
  if (!isValidCategories(draft)) {
    return NextResponse.json({ error: 'Draft ist ungültig oder leer.' }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (draft.length > 0) {
    const { error: crmError } = await supabase
      .from('categories')
      .upsert(
        draft.map((c) => ({ id: c.id, name: c.name })),
        { onConflict: 'id', ignoreDuplicates: true },
      );
    if (crmError) return NextResponse.json({ error: crmError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from('site_categories_content')
    .update({ published: draft, published_at: now, updated_at: now })
    .eq('id', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
