'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBookingModal } from '@/context/BookingModalContext';
import { parseFaqBlocks, type FaqChatEntry } from '@/lib/faq/parseFaqChat';
import { findBestAnswer } from '@/lib/faq/match';
import type { FaqChatContent } from '@/lib/content/faqChatTypes';

type ChatMessage = { role: 'user' | 'bot'; text: string; showBookingCta?: boolean };
/** Visible UI toggle only offers de/en. Turkish content still exists in
 * faq_chat_content['tr'] and is matched silently — if a visitor types in
 * Turkish, the answer comes back in Turkish even though no TR button is
 * shown (see `entries`, which pools all locales' content for matching). */
type WidgetLocale = 'de' | 'en';

/**
 * Widget-internal language switch — independent of the site's URL locale
 * (which only has de/en, see src/i18n/routing.ts). Adding a real 3rd site
 * locale would touch routing/SEO/hreflang everywhere; the chat itself just
 * needs its own small dictionary + a matching faq_chat_content['tr'] block.
 */
const UI_TEXT: Record<WidgetLocale, {
  title: string; greeting: string; fallback: string; placeholder: string;
  send: string; bookingCta: string; openLabel: string; closeLabel: string;
}> = {
  de: {
    title: 'EPILISSE Assistent',
    greeting: 'Hallo! Wie kann ich Ihnen weiterhelfen? Fragen Sie mich gerne zu unseren Behandlungen, Preisen oder Öffnungszeiten.',
    fallback: 'Das kann ich Ihnen leider nicht genau beantworten. Am besten klären wir das persönlich — buchen Sie einfach einen Termin, unser Team hilft Ihnen gerne weiter.',
    placeholder: 'Ihre Frage...', send: 'Senden', bookingCta: 'Termin buchen',
    openLabel: 'Chat öffnen', closeLabel: 'Chat schließen',
  },
  en: {
    title: 'EPILISSE Assistant',
    greeting: 'Hello! How can I help you? Feel free to ask about our treatments, prices, or opening hours.',
    fallback: "I'm not able to answer that precisely. It's best to clarify this in person — just book an appointment and our team will be happy to help.",
    placeholder: 'Your question...', send: 'Send', bookingCta: 'Book appointment',
    openLabel: 'Open chat', closeLabel: 'Close chat',
  },
};

const LOCALE_LABEL: Record<WidgetLocale, string> = { de: 'DE', en: 'EN' };

export default function FaqChatWidget({ content, initialLocale = 'de' }: { content: FaqChatContent; initialLocale?: WidgetLocale }) {
  const { open } = useBookingModal();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<WidgetLocale>(initialLocale);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const t = UI_TEXT[lang];

  // Pooled across every locale in content (de/en/tr) — a visitor typing in
  // Turkish gets matched (and answered) against faq_chat_content['tr'] even
  // though the visible toggle only shows DE/EN.
  const entries: FaqChatEntry[] = useMemo(
    () => Object.values(content).flatMap((cat) => Object.values(cat).flatMap((raw) => parseFaqBlocks(raw))),
    [content],
  );

  const shownMessages: ChatMessage[] = messages.length > 0 ? messages : [{ role: 'bot', text: t.greeting }];

  const switchLang = (next: WidgetLocale) => {
    setLang(next);
    setMessages([]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');

    const match = findBestAnswer(text, entries);
    setMessages((prev) => [
      ...(prev.length > 0 ? prev : [{ role: 'bot' as const, text: t.greeting }]),
      { role: 'user', text },
      match
        ? { role: 'bot', text: match.answer }
        : { role: 'bot', text: t.fallback, showBookingCta: true },
    ]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? t.closeLabel : t.openLabel}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center lux-shadow hover:brightness-90 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[26px]">{isOpen ? 'close' : 'chat'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[28rem] max-h-[70vh] flex flex-col bg-surface border border-outline-variant/40 rounded-2xl lux-shadow overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-outline-variant/40 bg-surface-container-low flex items-center justify-between">
              <p className="font-label-caps text-[11px] tracking-wide uppercase text-on-surface-variant">{t.title}</p>
              <div className="flex gap-1">
                {(Object.keys(UI_TEXT) as WidgetLocale[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => switchLang(l)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-label-caps tracking-wide transition-colors ${
                      lang === l ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {LOCALE_LABEL[l]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {shownMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 font-body-sm text-body-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface border border-outline-variant/30'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.showBookingCta && (
                      <button
                        type="button"
                        onClick={() => { setIsOpen(false); open(); }}
                        className="mt-2 w-full bg-primary text-on-primary rounded-lg py-1.5 font-label-caps text-[11px] uppercase tracking-wide hover:brightness-90 transition-all"
                      >
                        {t.bookingCta}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-outline-variant/40 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-full px-3 py-2 text-body-sm font-body-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label={t.send}
                className="w-9 h-9 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:brightness-90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
