'use client';

import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAdminLandingContent } from '@/hooks/useAdminLandingContent';

/**
 * Thin dark utility strip. `variant="fixed"` pins it to the very top of the
 * viewport (the nav then starts at top-9); `variant="static"` is the same bar
 * as a normal block, used once more directly under the footer.
 *
 *  left  — pink location pin + short location label · green pulse + a standing
 *          "appointments available" line (label hides < sm)
 *  right — NISHV certification seal (always visible) · compact Google +
 *          Treatwell rating chips (hidden < md), same numbers as the hero
 *          TrustBar / LocalBusiness schema
 */
const GoogleGlyph = (
  <svg viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const TreatwellGlyph = (
  <svg viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0" aria-hidden>
    <rect width="48" height="48" rx="11" fill="#FF5C8D" />
    <path fill="#fff" d="M12 15.5h24v5.2h-9.4V37h-5.2V20.7H12z" />
  </svg>
);

function RatingChip({
  glyph, label, rating, href, className = '',
}: { glyph: React.ReactNode; label: string; rating: string; href?: string; className?: string }) {
  const Tag = (href ? 'a' : 'span') as 'a' | 'span';
  return (
    <Tag
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex items-center gap-1.5 text-white/75 hover:text-white transition-colors ${className}`}
      aria-label={`${label}: ${rating} von 5`}
    >
      {glyph}
      <span className="font-body-sm text-[12px] tabular-nums">
        <span className="text-white font-semibold">{rating}</span>
        <span className="text-white/45"> / {label}</span>
      </span>
    </Tag>
  );
}

export default function AnnouncementBar({ variant = 'fixed' }: { variant?: 'fixed' | 'static' }) {
  const s = useAdminSettings();
  const lc = useAdminLandingContent();

  const location = lc.announceLocation?.trim() || s.address;
  const availability = lc.announceAvailability?.trim();

  const gRating = s.googleRating?.trim();
  const tRating = s.treatwellRating?.trim();

  return (
    <div
      className={`${
        variant === 'fixed' ? 'fixed top-0 left-0 z-50' : 'relative'
      } w-full h-9 bg-[#171310] text-white/75 border-b border-white/10`}
    >
      <div className="h-full max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-4">

        {/* left — location + availability */}
        <div className="flex items-center gap-3 min-w-0">
          {location && (
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[15px] text-[#E86FA6] shrink-0">location_on</span>
              <span className="font-body-sm text-[12px] truncate">{location}</span>
            </span>
          )}
          {location && availability && <span className="hidden sm:block w-px h-3.5 bg-white/15 shrink-0" />}
          {availability && (
            <span className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
              </span>
              <span className="font-body-sm text-[12px] text-white/80">{availability}</span>
            </span>
          )}
        </div>

        {/* right — NISHV certification seal (always) · rating chips (≥ md) */}
        <div className="flex items-center gap-4 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-white/80"
            aria-label="NISHV-zertifizierter Betrieb"
          >
            <span className="material-symbols-outlined text-[16px] text-[--color-primary-fixed-dim] shrink-0">
              workspace_premium
            </span>
            <span className="font-body-sm text-[12px] whitespace-nowrap">
              <span className="text-white font-semibold tracking-[0.08em]">NISHV</span>
              <span className="text-white/45 text-[11px]"> zertifiziert</span>
            </span>
          </span>

          {(gRating || tRating) && <span className="hidden md:block w-px h-3.5 bg-white/15" />}

          {gRating && (
            <RatingChip glyph={GoogleGlyph} label="Google" rating={gRating} href={s.google?.trim() || undefined} className="hidden md:inline-flex" />
          )}
          {gRating && tRating && <span className="hidden md:block w-px h-3.5 bg-white/15" />}
          {tRating && (
            <RatingChip glyph={TreatwellGlyph} label="Treatwell" rating={tRating} href={s.treatwellUrl?.trim() || undefined} className="hidden md:inline-flex" />
          )}
        </div>
      </div>
    </div>
  );
}
