'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Category } from '@/app/[locale]/admin/behandlungen/data';

const Ctx = createContext<Category[] | null>(null);

/** Wraps the locale layout with the SSR-resolved public category list (see getServerCategories). */
export function CategoriesProvider({ value, children }: { value: Category[]; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Internal — read the server-provided list. Falls back to null when no provider is mounted (should not happen in the app tree). */
export function useCategoriesFromServer() {
  return useContext(Ctx);
}
