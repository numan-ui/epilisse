'use client';
import type { PricingItem } from '@/components/ServicePageTemplate';
import { useSiteContent } from '@/context/SiteContentContext';

type RawService = { id: string; name: string; price: string; duration: string; active: boolean; oldPrice?: string };

function formatPrice(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  return `€ ${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(raw: string): string {
  // "60 min" → "60 Min."
  return raw.replace(/\bmin\.?$/i, 'Min.');
}

/**
 * Active pricing items for a category. SSR-resolved from `site_content`
 * (draft/published) via SiteContentProvider — used to be localStorage-only.
 * `oldPrice` is carried through only when set and different from `price`, so
 * the public list can render the discount ("AKTION") treatment.
 */
export function useAdminServices(catId: string, fallback: PricingItem[]): PricingItem[] {
  const svcs = useSiteContent().services?.[catId];
  if (!svcs) return fallback;

  const active = (svcs as RawService[])
    .filter(s => s.active)
    .map(s => {
      const item: PricingItem = {
        name:     s.name,
        duration: formatDuration(s.duration),
        price:    formatPrice(s.price),
      };
      const old = (s.oldPrice ?? '').trim();
      if (old && old !== (s.price ?? '').trim()) item.oldPrice = formatPrice(old);
      return item;
    });

  return active.length > 0 ? active : fallback;
}
