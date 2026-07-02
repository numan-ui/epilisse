'use client';
import { useState, useEffect } from 'react';
import { INIT_PROMO_BANNERS, type PromoBanner } from '@/app/[locale]/admin/behandlungen/data';

const LS_PROMO = 'epilisse_admin_promo_banners';

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

/** Returns promo (Kombi-Angebot) banners, reading from localStorage (admin state), falling back to defaults when empty. */
export function useAdminPromoBanners(): PromoBanner[] {
  const [banners, setBanners] = useState<PromoBanner[]>(INIT_PROMO_BANNERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PROMO);
      if (!raw) return;
      const stored: PromoBanner[] = JSON.parse(raw);
      if (stored.length === 0) return;
      setBanners(stored.map(p => mergeBanner(p, INIT_PROMO_BANNERS.find(d => d.id === p.id))));
    } catch { /* ignore */ }
  }, []);

  return banners;
}
