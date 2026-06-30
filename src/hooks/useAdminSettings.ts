'use client';
import { useState, useEffect } from 'react';
import { INIT_SETTINGS, type SiteSettings } from '@/app/[locale]/admin/behandlungen/data';

const LS_SET = 'epilisse_admin_settings';

export function useAdminSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(INIT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SET);
      if (raw) {
        const stored: Partial<SiteSettings> = JSON.parse(raw);
        setSettings(prev => ({
          ...prev,
          ...stored,
          heroImages: (stored.heroImages ?? prev.heroImages) as [string, string, string, string],
          hours: stored.hours ?? prev.hours,
        }));
      }
    } catch { /* ignore */ }
  }, []);

  return settings;
}
