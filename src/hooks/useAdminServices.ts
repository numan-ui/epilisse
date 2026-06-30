'use client';
import { useState, useEffect } from 'react';
import type { PricingItem } from '@/components/ServicePageTemplate';

const LS_SVC = 'epilisse_admin_services';

type RawService = { id: string; name: string; price: string; duration: string; active: boolean };

function formatPrice(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  return `€ ${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(raw: string): string {
  // "60 min" → "60 Min."
  return raw.replace(/\bmin\.?$/i, 'Min.');
}

/** Returns active pricing items for a category, reading from localStorage (admin state). */
export function useAdminServices(catId: string, fallback: PricingItem[]): PricingItem[] {
  const [items, setItems] = useState<PricingItem[]>(fallback);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SVC);
      if (!raw) return;
      const all: Record<string, RawService[]> = JSON.parse(raw);
      const svcs = all[catId];
      if (!svcs) return;
      const active = svcs
        .filter(s => s.active)
        .map(s => ({
          name:     s.name,
          duration: formatDuration(s.duration),
          price:    formatPrice(s.price),
        }));
      if (active.length > 0) setItems(active);
    } catch { /* ignore */ }
  }, [catId]);

  return items;
}
