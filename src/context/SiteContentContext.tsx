'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { SiteContent } from '@/app/[locale]/admin/behandlungen/data';

const Ctx = createContext<SiteContent | null>(null);

/** Wraps the locale layout with the SSR-resolved public CMS content (see getServerSiteContent). */
export function SiteContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Read the server-provided CMS content. Returns {} when no provider is mounted. */
export function useSiteContent(): SiteContent {
  return useContext(Ctx) ?? {};
}
