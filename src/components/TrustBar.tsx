'use client';

import { useId } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

/**
 * Hero trust bar: Google + Treatwell as two crisp-white cards — brand mark,
 * serif score /5, a half-star row computed from the rating, and the review
 * count. Each card links to its public profile. The same numbers feed
 * LocalBusinessSchema's aggregateRating. White works on both the sage split-
 * hero panel and the dark story-slider photo, so there is no tone variant.
 */
type Provider = {
  label: string;
  rating: string;
  countText: string;
  href?: string;
  logo: React.ReactNode;
};

const GoogleMark = (
  <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const TreatwellMark = (
  <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0" aria-hidden>
    <rect width="48" height="48" rx="11" fill="#001B38" />
    <path fill="#FF5C8D" d="M12 15.5h24v5.2h-9.4V37h-5.2V20.7H12z" />
  </svg>
);

/** German comma "4,8" → number 4.8 for the star maths. */
const toNum = (v: string) => Number(v.replace(',', '.')) || 0;

function Stars({ rating, uid }: { rating: number; uid: string }) {
  return (
    <span className="inline-flex gap-px" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const pct = Math.round(Math.max(0, Math.min(1, rating - i)) * 100);
        const gid = `${uid}-s${i}`;
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gid}>
                <stop offset={`${pct}%`} stopColor="#C29B45" />
                <stop offset={`${pct}%`} stopColor="#DAD4C6" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gid})`}
              d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6 21.3l1.2-6.6L2.4 9.5l6.6-.9z"
            />
          </svg>
        );
      })}
    </span>
  );
}

export default function TrustBar({ className = '' }: { className?: string }) {
  const s = useAdminSettings();
  const uid = useId();

  // Count line only shows when a number is actually set — no bare "Rezensionen".
  const gCount = s.googleReviewCount?.trim();
  const tCount = s.treatwellReviewCount?.trim();

  const providers: Provider[] = [
    s.googleRating?.trim() && {
      label: 'Google',
      rating: s.googleRating.trim(),
      countText: gCount ? `${gCount} Rezensionen` : '',
      href: s.google?.trim() || undefined,
      logo: GoogleMark,
    },
    s.treatwellRating?.trim() && {
      label: 'Treatwell',
      rating: s.treatwellRating.trim(),
      countText: tCount ? `${tCount} Kundenstimmen` : '',
      href: s.treatwellUrl?.trim() || undefined,
      logo: TreatwellMark,
    },
  ].filter(Boolean) as Provider[];

  if (providers.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 min-[420px]:grid-cols-2 items-stretch gap-2.5 max-w-[440px] ${className}`}
    >
      {providers.map((p) => {
        const Tag = (p.href ? 'a' : 'div') as 'a' | 'div';
        return (
          <Tag
            key={p.label}
            {...(p.href
              ? { href: p.href, target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            aria-label={`${p.label}: ${p.rating} von 5 Sternen${p.countText ? `, ${p.countText}` : ''}`}
            className="flex items-center gap-3 rounded-xl bg-white border border-black/[0.08] px-4 py-3.5 shadow-[0_14px_30px_-12px_rgba(20,14,12,0.5)] transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {p.logo}
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="font-label-caps text-[9.5px] font-bold tracking-[0.16em] uppercase text-[#8A8178]">
                {p.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-display-lg font-bold text-[20px] leading-none text-[#2B2621] tabular-nums">
                  {p.rating}
                  <span className="font-body-sm font-medium text-[11px] text-[#9A9188] ml-1">/5</span>
                </span>
                <Stars rating={toNum(p.rating)} uid={`${uid}-${p.label}`} />
              </span>
              {/* Always rendered so both cards keep the same height even when
                  one provider has no count set. */}
              <span className="font-body-sm text-[11px] font-medium text-[#8A8178]">
                {p.countText || ' '}
              </span>
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
