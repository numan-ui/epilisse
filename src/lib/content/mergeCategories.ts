import { CATEGORIES, type Category } from '@/app/[locale]/admin/behandlungen/data';

/** Empty string in an admin field means "not set" — fall back to the default rather than rendering blank. */
const str = (v: string | undefined, fallback: string) => (v && v.trim() !== '') ? v : fallback;

/**
 * Reconciles a stored category list against the code defaults:
 *  - drops stale entries for built-in categories no longer in code,
 *  - fills any blank admin field on a built-in category from its code default,
 *  - INJECTS any built-in that code defines but the stored list is missing
 *    (e.g. a new default category added after this browser last saved), in the
 *    code-defined order and ahead of admin-created ('cat-') categories.
 * Admin-created categories pass through unchanged — there's no default to fall
 * back to. Pure (no server-only deps) so both the client localStorage path
 * ([[useAdminCategories]] / AdminDataContext) and the server DB path
 * ([[getServerCategories]]) apply the exact same rule.
 */
export function mergeCategories(stored: Category[]): Category[] {
  const builtins = CATEGORIES.map((def) => {
    const c = stored.find((s) => s.id === def.id);
    if (!c) return { ...def };
    // image is intentionally not force-defaulted: empty means "use the built-in photo", a valid state.
    return {
      id: c.id,
      icon: str(c.icon, def.icon),
      name: str(c.name, def.name),
      desc: str(c.desc, def.desc),
      visible: c.visible,
      image: c.image ?? '',
      kicker: str(c.kicker, def.kicker),
    };
  });
  const customs = stored.filter((c) => c.id.startsWith('cat-'));
  return [...builtins, ...customs];
}
