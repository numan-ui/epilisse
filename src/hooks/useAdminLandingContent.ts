'use client';
import { INIT_LANDING_CONTENT, type LandingContent } from '@/app/[locale]/admin/behandlungen/data';
import { useSiteContent } from '@/context/SiteContentContext';

/**
 * Landing-page copy (nav labels, section titles, footer text). SSR-resolved
 * from `site_content` via SiteContentProvider — used to be localStorage-only.
 */
export function useAdminLandingContent(): LandingContent {
  const stored = useSiteContent().landingContent;
  return stored ? { ...INIT_LANDING_CONTENT, ...stored } : INIT_LANDING_CONTENT;
}
