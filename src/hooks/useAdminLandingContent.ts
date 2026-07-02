'use client';
import { useState, useEffect } from 'react';
import { INIT_LANDING_CONTENT, type LandingContent } from '@/app/[locale]/admin/behandlungen/data';

const LS_LC = 'epilisse_admin_landing_content';

export function useAdminLandingContent(): LandingContent {
  const [content, setContent] = useState<LandingContent>(INIT_LANDING_CONTENT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LC);
      if (!raw) return;
      const stored: Partial<LandingContent> = JSON.parse(raw);
      setContent(prev => ({ ...prev, ...stored }));
    } catch { /* ignore */ }
  }, []);

  return content;
}
