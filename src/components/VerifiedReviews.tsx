'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import TrustBar from '@/components/TrustBar';

/**
 * Homepage social-proof band, under the owner manifesto. A deliberately dark
 * panel: rose kicker, serif headline, the live white Google + Treatwell
 * TrustBar cards on the right, then verified CMS reviews (`useAdminReviews`,
 * active only, up to 10) shown three at a time with ‹ › paging. Colours are
 * literal — the block commits to one dark look regardless of theme.
 */
const GOLD = '#C8A24C';
const PER_PAGE = 3;

function StarRow({ size = 15, count = 5 }: { size?: number; count?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={GOLD}>
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6 21.3l1.2-6.6L2.4 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function VerifiedReviews() {
  const reviews = useAdminReviews().filter((r) => r.active).slice(0, 10);
  const [page, setPage] = useState(0);

  if (reviews.length === 0) return null;

  const pageCount = Math.ceil(reviews.length / PER_PAGE);
  const safePage = Math.min(page, pageCount - 1);
  const shown = reviews.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-section-gap">
      <div
        className="rounded-[22px] border border-white/[0.07] px-7 py-10 md:px-12 md:py-12"
        style={{ background: 'linear-gradient(160deg,#2A211E 0%,#1E1714 100%)' }}
      >
        {/* Header — title left, live Google + Treatwell cards right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <span className="font-label-caps text-label-caps tracking-[0.22em] text-[#D9A7B4] block mb-4">
              Verifizierte Kundenerfahrungen
            </span>
            <h2 className="font-display-lg text-headline-lg font-semibold text-[#F5EEE8] leading-tight text-balance max-w-[22ch]">
              Was Münchnerinnen über unsere Behandlungen sagen
            </h2>
          </div>
          <TrustBar className="lg:shrink-0" />
        </div>

        <div className="mt-9 mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.08]" />
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[11px] tracking-wider text-[#8C837A] tabular-nums mr-1">
                {safePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Vorherige Bewertungen"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                className="w-9 h-9 rounded-full border border-white/15 text-[#E8DED4] flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Weitere Bewertungen"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                className="w-9 h-9 rounded-full border border-white/15 text-[#E8DED4] flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* Reviews — three at a time */}
        <AnimatePresence mode="wait">
          <motion.div
            key={safePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {shown.map((r) => (
              <figure
                key={r.id}
                className="flex flex-col rounded-2xl bg-white/[0.045] border border-white/[0.09] p-6"
              >
                <StarRow />
                <blockquote className="mt-4 mb-6 font-display-lg text-[16.5px] leading-relaxed italic text-[#D6CCC2] line-clamp-6">
                  &bdquo;{r.text}&ldquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
                  <span className="font-label-caps text-[12px] font-semibold tracking-wide text-[#9C9188]">
                    {r.name}
                  </span>
                  {r.treatment && (
                    <span className="inline-flex items-center gap-1 font-label-caps text-[10.5px] font-semibold text-[#7FD1A8] bg-[#7FD1A8]/10 rounded-full px-2.5 py-1">
                      <span aria-hidden>✓</span>
                      {r.treatment}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
