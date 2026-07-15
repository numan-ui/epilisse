'use client';
import { useState, useEffect } from 'react';
import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

const LS_CAT = 'epilisse_admin_categories';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeCategories(stored: Category[]): Category[] {
  return stored
    // Drop stale localStorage entries for built-in categories that no longer exist in code
    // (e.g. a removed default category) — only keep current built-ins plus admin-created ('cat-') ones.
    .filter(c => CATEGORIES.some(d => d.id === c.id) || c.id.startsWith('cat-'))
    .map(c => {
      const def = CATEGORIES.find(d => d.id === c.id);
      if (!def) return c; // custom, admin-created category — no default to fall back to
      // image is intentionally not force-defaulted here: empty means "use the built-in photo", a valid state (see usage site fallback)
      return { id: c.id, icon: str(c.icon, def.icon), name: str(c.name, def.name), desc: str(c.desc, def.desc), visible: c.visible, image: c.image ?? '', kicker: str(c.kicker, def.kicker) };
    });
}

export function useAdminCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CAT);
      if (raw) {
        const stored: Category[] = JSON.parse(raw);
        if (stored.length > 0) {
          const merged = mergeCategories(stored);
          setCats(merged);
          // Persist the cleanup here too — otherwise a stale built-in id (e.g. a
          // removed default category) lingers until the admin page happens to be
          // the first tab to load and rewrite it.
          if (merged.length !== stored.length) localStorage.setItem(LS_CAT, JSON.stringify(merged));
        }
      }
    } catch { /* ignore */ }
  }, []);

  return cats;
}
