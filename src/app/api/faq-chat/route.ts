import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { FaqChatContent } from '@/lib/content/faqChatTypes';

/**
 * FAQ chatbot content — DB-backed draft/publish, mirrors /api/categories and
 * /api/content. See supabase/migrations/0025_faq_chat_content.sql and
 * src/lib/content/faqChat.ts.
 */

function isValid(body: unknown): body is FaqChatContent {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  return Object.values(body as Record<string, unknown>).every((locale) => {
    if (!locale || typeof locale !== 'object' || Array.isArray(locale)) return false;
    return Object.values(locale as Record<string, unknown>).every((v) => typeof v === 'string');
  });
}

/** `?content=draft`: admin only — seed the editor from the shared draft. */
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
    .from('faq_chat_content')
    .select('draft, updated_at')
    .eq('id', 1)
    .maybeSingle();
  if (error) return dbError('faq-chat', error, 500);
  return NextResponse.json({ draft: data?.draft ?? null, updatedAt: data?.updated_at ?? null });
}

/** Admin only — write the admin's edited FAQ text into `draft`. Never touches `published`. */
export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValid(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('faq_chat_content')
    .update({ draft: body, updated_at: now })
    .eq('id', 1);
  if (error) return dbError('faq-chat', error, 500);

  return NextResponse.json({ ok: true, updatedAt: now });
}

/** Admin only — "Veröffentlichen": copies `draft` -> `published`. */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data, error: readError } = await supabase
    .from('faq_chat_content')
    .select('draft')
    .eq('id', 1)
    .maybeSingle();
  if (readError) return dbError('faq-chat', readError, 500);

  const draft = (data?.draft ?? {}) as FaqChatContent;
  if (!isValid(draft)) {
    return NextResponse.json({ error: 'Draft ist ungültig.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('faq_chat_content')
    .update({ published: draft, published_at: now, updated_at: now })
    .eq('id', 1);
  if (error) return dbError('faq-chat', error, 500);

  return NextResponse.json({ ok: true });
}
