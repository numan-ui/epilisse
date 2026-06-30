'use client';
import { useState, useEffect } from 'react';
import { INIT_CAMPAIGNS, type Campaign as AdminCampaign } from '@/app/[locale]/admin/behandlungen/data';
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
  };
}

export function useAdminCampaigns(catId: string): {
  campaign1?: FrontendCampaign;
  campaign2?: FrontendCampaign;
} {
  const initActive = (INIT_CAMPAIGNS[catId] ?? []).filter(c => c.active);
  const [result, setResult] = useState<{ campaign1?: FrontendCampaign; campaign2?: FrontendCampaign }>({
    campaign1: initActive[0] ? toFrontend(initActive[0]) : undefined,
    campaign2: initActive[1] ? toFrontend(initActive[1]) : undefined,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CMP);
      if (!raw) return;
      const all: Record<string, AdminCampaign[]> = JSON.parse(raw);
      const active = (all[catId] ?? []).filter(c => c.active);
      if (active.length === 0) return;
      setResult({
        campaign1: active[0] ? toFrontend(active[0]) : undefined,
        campaign2: active[1] ? toFrontend(active[1]) : undefined,
      });
    } catch { /* ignore */ }
  }, [catId]);

  return result;
}
