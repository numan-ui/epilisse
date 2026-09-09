'use client';
import { INIT_FAQ_GROUPS, type FaqGroup } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/**
 * Homepage FAQ groups. SSR-resolved from `site_content` via SiteContentProvider,
 * same pattern as useAdminReviews. Returns the hardcoded INIT_FAQ_GROUPS (empty)
 * until the admin adds and publishes a group.
 */
export function useAdminFaqGroups(): FaqGroup[] {
  const stored = useSiteContent().faqGroups;
  return stored && stored.length > 0 ? stored : INIT_FAQ_GROUPS;
}
