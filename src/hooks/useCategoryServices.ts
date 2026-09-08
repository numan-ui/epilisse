'use client';
import { useState, useEffect } from 'react';
import { INIT_SERVICES, type Service } from '@/app/[locale]/admin/behandlungen/data';
import { useAktionen, visibleAktionen } from '@/hooks/useAktionen';
import { priceToNumber } from '@/lib/price';

const LS_SVC = 'epilisse_admin_services';

/** Active services for a category, reading admin overrides (localStorage) with built-in fallback — raw shape (numeric price string, duration string) for booking use. */
export function useCategoryServices(categoryId: string): Service[] {
  const aktionen = useAktionen();
  const [services, setServices] = useState<Service[]>(INIT_SERVICES[categoryId] ?? []);

  useEffect(() => {
    let list = INIT_SERVICES[categoryId] ?? [];
    try {
      const raw = localStorage.getItem(LS_SVC);
      if (raw) {
        const all: Record<string, Service[]> = JSON.parse(raw);
        if (all[categoryId]) list = all[categoryId];
      }
    } catch { /* ignore */ }
    setServices(list.filter((s) => s.active));
  }, [categoryId]);

  // The "Aktionen" pseudo-category keeps no service list of its own: every
  // active Aktion is offered as one bookable line (title + price), auto-updating
  // as Aktionen are added/edited in /admin/aktionen. Duration is a nominal
  // 30 min slot — the actual treatment time is confirmed by the studio.
  if (categoryId === 'aktionen') {
    return visibleAktionen(aktionen).map((a) => ({
      id: a.id,
      name: a.title,
      price: String(priceToNumber(a.price) ?? 0),
      duration: '30 min',
      active: true,
    }));
  }

  return services;
}

export function parseDurationMin(duration: string): number {
  const n = parseInt(duration, 10);
  return isNaN(n) ? 30 : n;
}
