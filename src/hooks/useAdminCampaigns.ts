'use client';
import { useState, useEffect } from 'react';
import { INIT_CAMPAIGNS, type Campaign as AdminCampaign, type PageContent } from '@/app/[locale]/admin/behandlungen/data';
import type { Campaign as FrontendCampaign } from '@/components/ServicePageTemplate';

const LS_CMP = 'epilisse_admin_campaigns';

function toFrontend(c: AdminCampaign): FrontendCampaign {
  return {
    label: c.label || 'AKTION',
    title: c.title,
    body: c.desc,
    cta: c.cta || 'JETZT BUCHEN',
    icon: c.icon || 'auto_fix_high',
    image: c.image || '',
    imagePosition: c.imagePosition,
    price: c.price,
    oldPrice: c.oldPrice,
  };
}

/** All active campaigns for a category, in list order — the page decides how many get a full banner. */
export function useAdminCampaigns(catId: string): FrontendCampaign[] {
  const initActive = (INIT_CAMPAIGNS[catId] ?? []).filter(c => c.active);
  const [result, setResult] = useState<FrontendCampaign[]>(initActive.map(toFrontend));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CMP);
      if (!raw) return;
      const all: Record<string, AdminCampaign[]> = JSON.parse(raw);
      const active = (all[catId] ?? []).filter(c => c.active);
      setResult(active.map(toFrontend));
    } catch { /* ignore */ }
  }, [catId]);

  return result;
}

/** If the admin has added real campaigns, show those; otherwise fall back to the 2 fixed Seiteninhalt banners. */
export function resolveCampaigns(
  pageContent: Pick<PageContent, 'campaign1' | 'campaign2'>,
  adminCampaigns: FrontendCampaign[],
): FrontendCampaign[] {
  if (adminCampaigns.length > 0) return adminCampaigns;
  return [pageContent.campaign1, pageContent.campaign2].filter(b => b.title.trim() !== '');
}
