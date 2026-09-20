// Static page config — applies to all public service/info pages
// Enables prerendering + ISR (incremental static regeneration) so Vercel
// doesn't consume dynamic request quota for cached pages.
export const STATIC_PAGE_CONFIG = {
  dynamic: 'force-static',
  revalidate: 3600, // 1 hour
} as const;
