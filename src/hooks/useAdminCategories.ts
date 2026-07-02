'use client';
import { useState, useEffect } from 'react';
import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

const LS_CAT = 'epilisse_admin_categories';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeCategories(stored: Category[]): Category[] {
  return stored.map(c => {
    const def = CATEGORIES.find(d => d.id === c.id);
    if (!def) return c; // custom, admin-created category — no default to fall back to
    // image is intentionally not force-defaulted here: empty means "use the built-in photo", a valid state (see usage site fallback)
    return { id: c.id, icon: str(c.icon, def.icon), name: str(c.name, def.name), desc: str(c.desc, def.desc), visible: c.visible, image: c.image ?? '' };
  });
}

export function useAdminCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CAT);
      if (raw) {
        const stored: Category[] = JSON.parse(raw);
        if (stored.length > 0) setCats(mergeCategories(stored));
      }
    } catch { /* ignore */ }
  }, []);

  return cats;
}
