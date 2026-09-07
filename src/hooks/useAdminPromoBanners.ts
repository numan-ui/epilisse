'use client';
import { INIT_PROMO_BANNERS, type PromoBanner } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeBanner(stored: PromoBanner, fallback?: PromoBanner): PromoBanner {
  if (!fallback) return stored;
  return {
    id: stored.id,
    label:      str(stored.label, fallback.label),
    title:      str(stored.title, fallback.title),
    desc:       str(stored.desc, fallback.desc),
    ctaPrimary:   str(stored.ctaPrimary, fallback.ctaPrimary),
    ctaSecondary: str(stored.ctaSecondary, fallback.ctaSecondary),
    image:      str(stored.image, fallback.image),
  };
}

/**
 * Promo (Kombi-Angebot) banners for the homepage. SSR-resolved from
 * `site_content` via SiteContentProvider — used to be localStorage-only.
 */
export function useAdminPromoBanners(): PromoBanner[] {
  const stored = useSiteContent().promoBanners;
  if (!stored || stored.length === 0) return INIT_PROMO_BANNERS;
  return stored.map(p => mergeBanner(p, INIT_PROMO_BANNERS.find(d => d.id === p.id)));
}
