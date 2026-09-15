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
  const { content } = await getServerFaqChatState();
  return content;
}

/** Same read, plus the instant on/off switch (defaults to enabled if unreachable). */
export async function getServerFaqChatState(): Promise<{ content: FaqChatContent; enabled: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { content: {}, enabled: true };

  try {
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      // Revalidated every 60s (Next.js data cache) rather than no-store: every
      // page request was paying a live Supabase round-trip, which was the
      // dominant cost in a ~1.5-2.5s TTFB. Admin publishes / enable-toggle now
      // apply within 60s instead of instantly — acceptable tradeoff for the
      // TTFB win.
      global: { fetch: (u, o) => fetch(u, { ...o, cache: undefined, next: { revalidate: 60 } }) },
    });
    const { data, error } = await sb
      .from('faq_chat_content')
      .select('draft, published, enabled')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return { content: {}, enabled: true };

    const column = process.env.CONTENT_PREVIEW === '1' ? data.draft : data.published;
    const content = column && typeof column === 'object' && !Array.isArray(column) ? (column as FaqChatContent) : {};
    return { content, enabled: data.enabled ?? true };
  } catch {
    return { content: {}, enabled: true };
  }
}
