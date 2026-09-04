'use client';
import { CATEGORIES } from '@/app/[locale]/admin/behandlungen/data';
import { useCategoriesFromServer } from '@/context/CategoriesContext';

/**
 * The public-facing category list. Used to be localStorage-only (per-browser,
 * never reached other visitors or production — see memory:
 * project_categories_db_migration_2026-09-04). Now SSR-resolved from
 * `site_categories_content` (draft/published, see getServerCategories) and
 * handed down via CategoriesProvider in the locale layout — this hook just
 * reads that context, so every existing caller keeps the same return shape
 * with zero changes at the call site.
 *
 * Not used by the admin's own category editor — that stays localStorage-backed
 * for the admin's live-editing UX, see AdminDataContext.tsx.
 */
export function useAdminCategories() {
  const fromServer = useCategoriesFromServer();
  return fromServer ?? CATEGORIES;
}
