'use client';
import { useState } from 'react';
import { useAdminFaqGroups } from '@/hooks/useAdminFaqGroups';
import BookingFlow from './BookingFlow';

/**
 * Homepage FAQ block: admin-named category tabs on the left with a
 * question/answer accordion, and the real booking wizard embedded inline on
 * the right (same flow as the modal, see BookingFlow). Renders nothing until
 * the admin adds at least one FAQ group with a question.
 */
export default function FaqSection() {
  const groups = useAdminFaqGroups().filter((g) => g.items.some((i) => i.q.trim() && i.a.trim()));
  const [activeGroup, setActiveGroup] = useState(0);
  const [openItem, setOpenItem] = useState<string | null>(null);

  if (groups.length === 0) return null;

  const current = groups[Math.min(activeGroup, groups.length - 1)];
  const items = current.items.filter((i) => i.q.trim() && i.a.trim());

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) =>
      g.items
        .filter((i) => i.q.trim() && i.a.trim())
        .map((i) => ({
          '@type': 'Question',
          name: i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        })),
    ),
  };

  return (
    <section
      id="faq"
      className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-gutter items-start">
        {/* ── FAQ column ─────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em]">
              HÄUFIGE FRAGEN
            </span>
            <span className="w-16 h-[2px] bg-primary" />
          </div>
          <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-8">
            Alles, was Sie vor Ihrer Behandlung wissen müssen.
          </h2>

          {groups.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {groups.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGroup(i);
                    setOpenItem(null);
                  }}
                  className={`px-4 py-2 font-label-caps text-label-caps tracking-wider border transition-all ${
                    i === activeGroup
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {g.label || `Kategorie ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="divide-y divide-outline-variant/50 border-y border-outline-variant/50">
            {items.map((it) => {
              const isOpen = openItem === it.id;
              return (
                <div key={it.id}>
                  <button
                    onClick={() => setOpenItem(isOpen ? null : it.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">
                      {it.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-outline shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant pb-5 -mt-1 max-w-prose whitespace-pre-line">
                      {it.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Inline booking column ──────────────────── */}
        <div className="lg:sticky lg:top-28">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em]">
              ONLINE TERMINPLANER
            </span>
          </div>
          <BookingFlow variant="inline" active preselectedCategory={null} />
        </div>
      </div>
    </section>
  );
}
