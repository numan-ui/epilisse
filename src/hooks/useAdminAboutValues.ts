'use client';
import { useState, useEffect } from 'react';
import { INIT_ABOUT_VALUES, type AboutValue } from '@/app/[locale]/admin/behandlungen/data';

const LS_ABOUT = 'epilisse_admin_about_values';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeValue(stored: AboutValue, fallback?: AboutValue): AboutValue {
  if (!fallback) return stored;
  return {
    id: stored.id,
    icon:  str(stored.icon, fallback.icon),
    title: str(stored.title, fallback.title),
    desc:  str(stored.desc, fallback.desc),
  };
}

/** Returns "Über Uns" value items, reading from localStorage (admin state), falling back to defaults when empty. */
export function useAdminAboutValues(): AboutValue[] {
  const [values, setValues] = useState<AboutValue[]>(INIT_ABOUT_VALUES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ABOUT);
      if (!raw) return;
      const stored: AboutValue[] = JSON.parse(raw);
      if (stored.length === 0) return;
      setValues(stored.map(v => mergeValue(v, INIT_ABOUT_VALUES.find(d => d.id === v.id))));
    } catch { /* ignore */ }
  }, []);

  return values;
}
