import type { Aktion, SiteContent } from '@/app/[locale]/admin/behandlungen/data';
import { INIT_AKTIONEN, AKTION_HOME_LIMIT, AKTION_CATEGORY_LIMIT } from '@/app/[locale]/admin/behandlungen/data';

const DAY = 86_400_000;

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Badge text for the last 10 days before endDate. null = no badge. No auto-hide. */
export function countdownLabel(endDate?: string, now: Date = new Date()): string | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.round((startOfDay(end) - startOfDay(now)) / DAY);
  if (days > 10) return null;
  if (days > 1) return `Noch ${days} Tage`;
  if (days === 1) return 'Noch 1 Tag';
  if (days === 0) return 'Endet heute';
  return 'Abgelaufen';
}

function fmt(d: string): string {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

/** Plain display line for the validity period. null when no date is set. */
export function validityText(startDate?: string, endDate?: string): string | null {
  if (startDate && endDate) return `Gültig ${fmt(startDate)}–${fmt(endDate)}`;
  if (endDate) return `Gültig bis ${fmt(endDate)}`;
  if (startDate) return `Gültig ab ${fmt(startDate)}`;
  return null;
}

/**
 * Legacy-safe read: use `aktionen` when present, otherwise synthesise it from
 * the pre-migration `campaigns` + `promoBanners` keys so the site never breaks
 * before migration 0023 runs / a fresh "Veröffentlichen" persists the new shape.
 */
export function deriveAktionen(
  c: Pick<SiteContent, 'aktionen' | 'campaigns' | 'promoBanners'>,
): Aktion[] {
  if (c.aktionen && c.aktionen.length) return c.aktionen;

  const out: Aktion[] = [];
  for (const [category, list] of Object.entries(c.campaigns ?? {})) {
    for (const cmp of list ?? []) {
      out.push({
        id: cmp.id, category,
        label: cmp.label, title: cmp.title, desc: cmp.desc,
        price: cmp.price, oldPrice: cmp.oldPrice,
        cta: cmp.cta, icon: cmp.icon, image: cmp.image, imagePosition: cmp.imagePosition,
        activeInCategory: cmp.active, activeOnHome: false,
      });
    }
  }
  for (const p of c.promoBanners ?? []) {
    out.push({
      id: p.id, category: 'laser',
      label: p.label, title: p.title, desc: p.desc,
      price: '', oldPrice: undefined,
      cta: p.ctaPrimary || 'JETZT BUCHEN', icon: 'auto_awesome',
      image: p.image, activeInCategory: true, activeOnHome: true,
    });
  }
  return out;
}

/** Fallback to the hardcoded seed when nothing resolved — mirrors the old hooks. */
export function resolveAktionen(
  c: Pick<SiteContent, 'aktionen' | 'campaigns' | 'promoBanners'>,
): Aktion[] {
  const derived = deriveAktionen(c);
  return derived.length ? derived : INIT_AKTIONEN;
}

export function homeAktionen(list: Aktion[]): Aktion[] {
  return list.filter((a) => a.activeInCategory && a.activeOnHome).slice(0, AKTION_HOME_LIMIT);
}

export function categoryAktionen(list: Aktion[], catId: string): Aktion[] {
  return list.filter((a) => a.category === catId && a.activeInCategory).slice(0, AKTION_CATEGORY_LIMIT);
}

/** Everything eligible for the public /aktionen page. */
export function visibleAktionen(list: Aktion[]): Aktion[] {
  return list.filter((a) => a.activeInCategory);
}
