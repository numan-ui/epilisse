'use client';
import { useState, useEffect } from 'react';
import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

const LS_CAT = 'epilisse_admin_categories';

export function useAdminCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CAT);
      if (raw) {
        const stored: Category[] = JSON.parse(raw);
        if (stored.length > 0) setCats(stored);
      }
    } catch { /* ignore */ }
  }, []);

  return cats;
}
