'use client';
import { INIT_REVIEWS, type Review } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/**
 * Active (visible) reviews. SSR-resolved from `site_content` via
 * SiteContentProvider — used to be localStorage-only.
 */
export function useAdminReviews(): Review[] {
  const stored = useSiteContent().reviews;
  const all = stored && stored.length > 0 ? stored : INIT_REVIEWS;
  return all.filter(r => r.active);
}
