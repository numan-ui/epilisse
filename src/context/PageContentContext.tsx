'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { PageContentMap } from '@/app/[locale]/admin/behandlungen/data';

const Ctx = createContext<PageContentMap | null>(null);

/** Wraps the locale layout with the SSR-resolved public page-content map (see getServerPageContent). */
export function PageContentProvider({ value, children }: { value: PageContentMap; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Internal — read the server-provided map. Falls back to null when no provider is mounted. */
export function usePageContentFromServer() {
  return useContext(Ctx);
}
