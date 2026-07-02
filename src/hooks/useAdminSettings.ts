'use client';
import { useState, useEffect } from 'react';
import { INIT_SETTINGS, type SiteSettings, type OpeningDay } from '@/app/[locale]/admin/behandlungen/data';

const LS_SET = 'epilisse_admin_settings';

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

export function useAdminSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(INIT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SET);
      if (!raw) return;
      const stored: Partial<SiteSettings> = JSON.parse(raw);
      setSettings({
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
        hours: mergeHours(stored.hours),
      });
    } catch { /* ignore */ }
  }, []);

  return settings;
}
