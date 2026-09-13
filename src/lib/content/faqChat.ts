import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { FaqChatContent } from './faqChatTypes';

export type { FaqChatContent };

/**
 * SSR read for the public site (called from the locale layout, handed down as
 * a prop to FaqChatWidget). anon key + public-read RLS on `faq_chat_content`.
 * Reads `draft` when CONTENT_PREVIEW=1, otherwise `published`. Any failure —
 * env missing, table not yet migrated, network, null column — returns {}, so
 * the widget falls back to INIT_FAQ_CHAT_CONTENT exactly like a fresh browser.
 */
export async function getServerFaqChatContent(): Promise<FaqChatContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
    });
    const { data, error } = await sb
      .from('faq_chat_content')
      .select('draft, published')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return {};

    const column = process.env.CONTENT_PREVIEW === '1' ? data.draft : data.published;
    if (!column || typeof column !== 'object' || Array.isArray(column)) return {};
    return column as FaqChatContent;
  } catch {
    return {};
  }
}
