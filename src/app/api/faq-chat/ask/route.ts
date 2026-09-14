import { NextResponse } from 'next/server';
import { getServerFaqChatContent } from '@/lib/content/faqChat';
import { INIT_FAQ_CHAT_CONTENT } from '@/lib/content/faqChatTypes';

/**
 * Grounded (RAG-style) fallback for questions the local keyword matcher
 * (src/lib/faq/match.ts) can't answer. Gemini Flash (free tier) is instructed
 * to answer ONLY from the FAQ content below, in the customer's own language,
 * or reply with the exact token "NOT_FOUND" — never invent salon-specific
 * facts (prices, hours, medical claims) that aren't in the database. If
 * GEMINI_API_KEY is missing, the free tier is exhausted, or the model
 * returns NOT_FOUND, this returns { answer: null } and the widget falls back
 * to its own generic message + booking CTA — the same behaviour as before
 * this layer existed.
 */

const NOT_FOUND = 'NOT_FOUND';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function buildContext(content: Record<string, Record<string, string>>): string {
  const sections: string[] = [];
  for (const [locale, categories] of Object.entries(content)) {
    for (const [category, raw] of Object.entries(categories)) {
      if (raw?.trim()) sections.push(`[${locale}/${category}]\n${raw.trim()}`);
    }
  }
  return sections.join('\n\n');
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ answer: null });

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 500) : '';
  if (!message) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const stored = await getServerFaqChatContent();
  const content = {
    de: { ...INIT_FAQ_CHAT_CONTENT.de, ...stored.de },
    en: { ...INIT_FAQ_CHAT_CONTENT.en, ...stored.en },
    tr: { ...INIT_FAQ_CHAT_CONTENT.tr, ...stored.tr },
  };
  const context = buildContext(content);

  const systemInstruction =
    'You are Epibot, the customer support assistant for EPILISSE, a beauty salon in Munich. ' +
    'Answer the customer\'s question using ONLY the FAQ content provided below — never invent prices, ' +
    'hours, medical claims, or any other salon-specific fact that is not literally present in it. ' +
    'Reply in the same language the customer wrote in. Keep the answer short and friendly (max 3 sentences). ' +
    `If the FAQ content does not cover the question, reply with exactly this token and nothing else: ${NOT_FOUND}\n\n` +
    `FAQ CONTENT:\n${context}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
        }),
      },
    );

    if (!res.ok) return NextResponse.json({ answer: null });

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim() === NOT_FOUND || text.includes(NOT_FOUND)) {
      return NextResponse.json({ answer: null });
    }
    return NextResponse.json({ answer: text.trim() });
  } catch {
    return NextResponse.json({ answer: null });
  }
}
