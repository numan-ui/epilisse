'use client';
import { INIT_HERO_SLIDES, type HeroSlide } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeSlide(stored: HeroSlide, fallback?: HeroSlide): HeroSlide {
  const duration = stored.duration > 0 ? stored.duration : (fallback?.duration ?? 8);
  if (!fallback) return { ...stored, duration };
  return {
    id: stored.id,
    headline: str(stored.headline, fallback.headline),
    sub:      str(stored.sub, fallback.sub),
    cta:      str(stored.cta, fallback.cta),
    // '' is a valid, meaningful choice (booking modal) — only fall back when the field is missing entirely.
    ctaLink:  stored.ctaLink ?? fallback.ctaLink ?? '',
    image:    str(stored.image, fallback.image),
    duration,
  };
}

/**
 * Hero slider slides for the homepage. SSR-resolved from `site_content` via
 * SiteContentProvider — used to be localStorage-only.
 */
export function useAdminHeroSlides(): HeroSlide[] {
  const stored = useSiteContent().heroSlides;
  if (!stored || stored.length === 0) return INIT_HERO_SLIDES;
  return stored.map(s => mergeSlide(s, INIT_HERO_SLIDES.find(d => d.id === s.id)));
}
