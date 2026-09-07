'use client';
import { INIT_ABOUT_VALUES, type AboutValue } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

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

/**
 * "Über Uns" value items. SSR-resolved from `site_content` via
 * SiteContentProvider — used to be localStorage-only.
 */
export function useAdminAboutValues(): AboutValue[] {
  const stored = useSiteContent().aboutValues;
  if (!stored || stored.length === 0) return INIT_ABOUT_VALUES;
  return stored.map(v => mergeValue(v, INIT_ABOUT_VALUES.find(d => d.id === v.id)));
}
