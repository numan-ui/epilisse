'use client';
import { useState, useEffect } from 'react';
import { INIT_SERVICES, type Service } from '@/app/[locale]/admin/behandlungen/data';

const LS_SVC = 'epilisse_admin_services';

/** Active services for a category, reading admin overrides (localStorage) with built-in fallback — raw shape (numeric price string, duration string) for booking use. */
export function useCategoryServices(categoryId: string): Service[] {
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

  return services;
}

export function parseDurationMin(duration: string): number {
  const n = parseInt(duration, 10);
  return isNaN(n) ? 30 : n;
}
