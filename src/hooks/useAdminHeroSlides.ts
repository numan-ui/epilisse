'use client';
import { useState, useEffect } from 'react';
import { INIT_HERO_SLIDES, type HeroSlide } from '@/app/[locale]/admin/behandlungen/data';

const LS_HERO = 'epilisse_admin_hero_slides';

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
    image:    str(stored.image, fallback.image),
    duration,
  };
}

/** Returns hero slides, reading from localStorage (admin state), falling back to defaults when empty. */
export function useAdminHeroSlides(): HeroSlide[] {
  const [slides, setSlides] = useState<HeroSlide[]>(INIT_HERO_SLIDES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_HERO);
      if (!raw) return;
      const stored: HeroSlide[] = JSON.parse(raw);
      if (stored.length === 0) return;
      setSlides(stored.map(s => mergeSlide(s, INIT_HERO_SLIDES.find(d => d.id === s.id))));
    } catch { /* ignore */ }
  }, []);

  return slides;
}
