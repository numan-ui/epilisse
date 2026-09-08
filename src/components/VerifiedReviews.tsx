'use client';

import { useAdminReviews } from '@/hooks/useAdminReviews';
import { useAdminSettings } from '@/hooks/useAdminSettings';

/**
 * Homepage social-proof band, sitting under the owner manifesto. A deliberately
 * dark panel: rose kicker, serif headline, a combined Google + Treatwell score
 * on the right, then three verified review cards pulled from the CMS
 * (`useAdminReviews`, active only). Colours are literal — this block commits to
 * one dark look regardless of theme, like the white TrustBar cards do.
 */
const GOLD = '#C8A24C';

const digits = (v?: string) => Number((v || '').replace(/\D/g, '')) || 0;
const toNum = (v?: string) => Number((v || '').replace(',', '.')) || 0;

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
  const reviews = useAdminReviews().filter((r) => r.active).slice(0, 3);
  const s = useAdminSettings();

  if (reviews.length === 0) return null;

  const scores = [toNum(s.googleRating), toNum(s.treatwellRating)].filter(Boolean);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgLabel = avg ? avg.toFixed(1).replace('.', ',') : '';
  const total = digits(s.googleReviewCount) + digits(s.treatwellReviewCount);

  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-section-gap">
      <div
        className="rounded-[22px] border border-white/[0.07] px-7 py-10 md:px-12 md:py-12"
        style={{ background: 'linear-gradient(160deg,#2A211E 0%,#1E1714 100%)' }}
      >
        {/* Header — title left, combined score right */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">
          <div>
            <span className="font-label-caps text-label-caps tracking-[0.22em] text-[#D9A7B4] block mb-4">
              Verifizierte Kundenerfahrungen
            </span>
            <h2 className="font-display-lg text-headline-lg font-semibold text-[#F5EEE8] leading-tight text-balance max-w-[22ch]">
              Was Münchnerinnen über unsere Behandlungen sagen
            </h2>
          </div>

          {avgLabel && (
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-baseline gap-1.5">
                <span className="font-display-lg font-bold text-[42px] leading-none text-[#F5EEE8] tabular-nums">
                  {avgLabel}
                </span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={GOLD} aria-hidden>
                  <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6 21.3l1.2-6.6L2.4 9.5l6.6-.9z" />
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="font-headline-sm text-[15px] font-semibold text-[#F5EEE8]">
                  Hervorragend
                </span>
                <span className="font-body-sm text-[12.5px] text-[#B7ADA3] max-w-[28ch]">
                  {total > 0 ? `Über ${total} echte Bewertungen` : 'Echte Bewertungen'} via Treatwell &amp; Google
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-white/[0.08] my-9" />

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <figure
              key={r.id}
              className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6"
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
        </div>
      </div>
    </section>
  );
}
