'use client';
import { useSiteContent } from '@/context/SiteContentContext';
import { resolveAktionen, categoryAktionen } from '@/lib/aktion';
import type { Aktion, PageContent } from '@/app/[locale]/admin/behandlungen/data';
import type { Campaign as FrontendCampaign } from '@/components/ServicePageTemplate';

export { homeAktionen, categoryAktionen, visibleAktionen } from '@/lib/aktion';

/** All resolved Aktionen (legacy-safe, falls back to INIT_AKTIONEN). */
export function useAktionen(): Aktion[] {
  return resolveAktionen(useSiteContent());
}

/** Aktion → the shape ServicePageTemplate renders. */
export function aktionToCampaign(a: Aktion): FrontendCampaign {
  return {
    label: a.label || 'AKTION',
    title: a.title,
    body: a.desc,
    cta: a.cta || 'JETZT BUCHEN',
    icon: a.icon || 'auto_fix_high',
    image: a.image || '',
    imagePosition: a.imagePosition,
    price: a.price,
    oldPrice: a.oldPrice,
    startDate: a.startDate,
    endDate: a.endDate,
  };
}

/** Category-page campaign cards, sourced from the unified Aktion model. */
export function useCategoryCampaigns(catId: string): FrontendCampaign[] {
  return categoryAktionen(useAktionen(), catId).map(aktionToCampaign);
}

/** If the admin has Aktionen for this category, show those; otherwise fall back to the 2 fixed Seiteninhalt banners. */
export function resolveCampaigns(
  pageContent: Pick<PageContent, 'campaign1' | 'campaign2'>,
  categoryCampaigns: FrontendCampaign[],
): FrontendCampaign[] {
  if (categoryCampaigns.length > 0) return categoryCampaigns;
  return [pageContent.campaign1, pageContent.campaign2].filter((b) => b.title.trim() !== '');
}
