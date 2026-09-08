'use client';
import { INIT_SETTINGS, type SiteSettings, type OpeningDay } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

function mergeHours(stored: OpeningDay[] | undefined): OpeningDay[] {
  if (!stored) return INIT_SETTINGS.hours;
  return INIT_SETTINGS.hours.map((def, i) => {
    const d = stored[i];
    if (!d) return def;
    return { day: str(d.day, def.day), open: str(d.open, def.open), close: str(d.close, def.close), closed: d.closed };
  });
}

/**
 * Site settings for the public site. SSR-resolved from `site_content`
 * (draft/published, see getServerSiteContent) via SiteContentProvider — used
 * to be localStorage-only. The admin editor still writes localStorage for its
 * live-editing UX (AdminDataContext), mirrored to the DB draft.
 */
export function useAdminSettings(): SiteSettings {
  const stored = useSiteContent().settings;
  if (!stored) return INIT_SETTINGS;
  return {
    ...INIT_SETTINGS,
    ...stored,
    name:        str(stored.name, INIT_SETTINGS.name),
    tagline:     str(stored.tagline, INIT_SETTINGS.tagline),
    address:     str(stored.address, INIT_SETTINGS.address),
    phone:       str(stored.phone, INIT_SETTINGS.phone),
    email:       str(stored.email, INIT_SETTINGS.email),
    whatsapp:    str(stored.whatsapp, INIT_SETTINGS.whatsapp),
    calendarUrl: str(stored.calendarUrl, INIT_SETTINGS.calendarUrl),
    whatsappMsg: str(stored.whatsappMsg, INIT_SETTINGS.whatsappMsg),
    treatwellUrl: str(stored.treatwellUrl, INIT_SETTINGS.treatwellUrl),
    googleRating: str(stored.googleRating, INIT_SETTINGS.googleRating),
    treatwellRating: str(stored.treatwellRating, INIT_SETTINGS.treatwellRating),
    treatwellReviewCount: str(stored.treatwellReviewCount, INIT_SETTINGS.treatwellReviewCount),
    hours: mergeHours(stored.hours),
  };
}
