'use client';
import { INIT_CAMPAIGNS, type Campaign as AdminCampaign, type PageContent } from '@/app/[locale]/admin/behandlungen/data';
import type { Campaign as FrontendCampaign } from '@/components/ServicePageTemplate';
import { useSiteContent } from '@/context/SiteContentContext';

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

/**
 * All active campaigns for a category, in list order. SSR-resolved from
 * `site_content` via SiteContentProvider — used to be localStorage-only.
 */
export function useAdminCampaigns(catId: string): FrontendCampaign[] {
  const stored = useSiteContent().campaigns;
  const list = stored?.[catId] ?? INIT_CAMPAIGNS[catId] ?? [];
  return list.filter(c => c.active).map(toFrontend);
}

/** If the admin has added real campaigns, show those; otherwise fall back to the 2 fixed Seiteninhalt banners. */
export function resolveCampaigns(
  pageContent: Pick<PageContent, 'campaign1' | 'campaign2'>,
  adminCampaigns: FrontendCampaign[],
): FrontendCampaign[] {
  if (adminCampaigns.length > 0) return adminCampaigns;
  return [pageContent.campaign1, pageContent.campaign2].filter(b => b.title.trim() !== '');
}
