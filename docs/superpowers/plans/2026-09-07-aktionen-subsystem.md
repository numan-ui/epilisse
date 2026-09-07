# Aktionen-Subsystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vereine die Homepage-Promo-Banner und die Kategorie-Kampagnen zu einem `Aktion`-Modell, hebe beide Limits auf 10, gib jeder Aktion Gültigkeitsdaten + Countdown + zwei Aktiv-Schalter, und baue eine öffentliche `/aktionen`-Aggregationsseite.

**Architecture:** Ein Array `site_content.aktionen: Aktion[]`; jede Aktion trägt `category`. Kategorieseite / Startseite / `/aktionen` werden per Filter abgeleitet. Nutzt das bestehende `site_content` draft/publish-Plumbing (`SiteContentContext`, `/api/content`, "Veröffentlichen") unverändert weiter. Ein Code-Fallback (`deriveAktionen`) liest während des Migrationsfensters die Legacy-Keys `campaigns`/`promoBanners`, damit nichts bricht, bevor die SQL-Migration `0023` läuft.

**Tech Stack:** Next.js 15 (App Router, `[locale]`), TypeScript, Tailwind v4 (design tokens in `src/app/globals.css`), next-intl, Supabase (JSONB single-row `site_content`), Playwright E2E.

**Spec:** `docs/superpowers/specs/2026-09-07-aktionen-subsystem-design.md`

## Global Constraints

- **DB-Namen englisch**, UI-Text deutsch (siehe `memory/feedback_db_naming_english.md`). Der neue Schlüssel heißt `aktionen` (fester Produktbegriff, kein generisches Wort) — Feldnamen englisch: `category`, `startDate`, `endDate`, `activeInCategory`, `activeOnHome`.
- **Kategoriesystem bleibt hardcodiert.** "Aktion" ist KEIN `CATEGORIES`-Eintrag — eigenständige Seite `/aktionen` + Nav-Link. Kategorien sind weiter `'laser' | 'gesicht' | 'mani'` plus admin-erstellte `cat-*`.
- **Limits:** `AKTION_HOME_LIMIT = 10` (Summe der auf der Startseite aktiven Aktionen), `AKTION_CATEGORY_LIMIT = 10` (pro Kategorie).
- **Toggle-Regel:** effektiv auf der Startseite sichtbar ⇔ `activeInCategory && activeOnHome`. `activeInCategory === false` ⇒ unsichtbar auf Kategorieseite, Startseite UND `/aktionen`.
- **Kein Auto-Ausblenden** nach `endDate` — nur Anzeigetext + Countdown-Chip (≤ 10 Tage). Ablauf schaltet der Admin manuell.
- **Leeres Admin-Feld = Fallback auf Default**, nie leer rendern (siehe `memory/feedback_admin_empty_field_fallback.md`).
- **Section-Spacing** kommt aus dem Token `--spacing-section-gap` / den Klassen `mb-section-gap` / `py-section-gap` — nie pro Seite handtunen (siehe `memory/project_section_spacing_token_2026-09-07.md`).
- **Fonts:** Titel `font-headline-*` / `font-display-*` (Playfair Display), Rest `font-body-*` (Manrope) — über die vorhandenen Utility-Klassen, keine neuen `font-family`-Deklarationen.
- **Commit-Trailer:** jede Commit-Message endet mit
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
- Nach jeder Task: `npm run lint` und `npx tsc --noEmit` müssen sauber sein, bevor committet wird.

---

## File Structure

**Neu:**
- `src/lib/aktion.ts` — reine Helfer: `countdownLabel`, `validityText`, `deriveAktionen`, `homeAktionen`, `categoryAktionen`.
- `src/hooks/useAktionen.ts` — Client-Hook: liest `useSiteContent()`, wendet `deriveAktionen` an, fällt auf `INIT_AKTIONEN` zurück.
- `src/app/[locale]/aktionen/page.tsx` — öffentliche Aggregationsseite.
- `src/app/[locale]/admin/aktionen/page.tsx` — zentrale Admin-Verwaltung.
- `supabase/migrations/0023_aktionen.sql` — JSONB-Transformation `campaigns`+`promoBanners` → `aktionen`.
- `tests/e2e/admin-aktionen-crud.spec.ts` — ersetzt `admin-promo-banners-crud.spec.ts`.
- `src/lib/aktion.test.ts` — Unit-Tests der Helfer (falls kein Test-Runner: siehe Task 2 Hinweis).

**Geändert:**
- `src/app/[locale]/admin/behandlungen/data.ts` — `Aktion`-Typ, Limits, `INIT_AKTIONEN`, `navAktionen`, `SiteContent`-Schlüssel.
- `src/app/[locale]/admin/behandlungen/AdminDataContext.tsx` — `aktionen`-State + Callbacks statt `campaigns`-Map + `promoBanners`.
- `src/app/api/content/route.ts` — `KEYS` um `aktionen` erweitern.
- `src/hooks/useAdminCampaigns.ts`, `src/hooks/useAdminPromoBanners.ts` — entfernt; Consumer umgestellt.
- `src/components/ServicePageTemplate.tsx` — Datenquelle + Datum/Countdown + Nav-Link.
- `src/app/[locale]/page.tsx` — Banner-Redesign (Variant A) + Datenquelle + Nav-Link.
- `src/app/[locale]/admin/layout.tsx` — Nav-Eintrag "Aktionen".
- `src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx` — Kampagnen-Editor → Aktion-Editor.
- `src/app/[locale]/admin/startseite/page.tsx` — "Kombi-Angebot"-Tab entfernen.
- `src/app/[locale]/admin/einstellungen/page.tsx` — Textreferenz "Kombi-Angebot-Bilder" anpassen.
- `src/app/[locale]/behandlungen/page.tsx`, `preise/page.tsx`, `ueber-uns/page.tsx` — Nav-Link.
- `src/i18n/messages/de.json` — `nav.aktionen`, `promo.*` aufräumen.
- `src/app/[locale]/sitemap.ts` — `/aktionen`.

---

## Task 1: `Aktion` type, limits, `INIT_AKTIONEN`, `navAktionen`

**Files:**
- Modify: `src/app/[locale]/admin/behandlungen/data.ts`
- Test: `src/lib/aktion.test.ts` (created here, extended in Task 2)

**Interfaces:**
- Produces:
  - `type Aktion = { id: string; category: string; label: string; title: string; desc: string; price: string; oldPrice?: string; cta: string; icon: string; image: string; imagePosition?: ImagePosition; startDate?: string; endDate?: string; activeInCategory: boolean; activeOnHome: boolean }`
  - `const AKTION_HOME_LIMIT = 10`
  - `const AKTION_CATEGORY_LIMIT = 10`
  - `const INIT_AKTIONEN: Aktion[]`
  - `LandingContent.navAktionen: string` (default `'Aktionen'`)
  - `SiteContent.aktionen?: Aktion[]` (plus `campaigns?` / `promoBanners?` behalten, `@deprecated`)

- [ ] **Step 1: Write the failing test**

Create `src/lib/aktion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { INIT_AKTIONEN, AKTION_HOME_LIMIT, AKTION_CATEGORY_LIMIT, INIT_LANDING_CONTENT } from '@/app/[locale]/admin/behandlungen/data';

const KNOWN_CATEGORIES = ['laser', 'gesicht', 'mani'];

describe('INIT_AKTIONEN seed', () => {
  it('has both limits at 10', () => {
    expect(AKTION_HOME_LIMIT).toBe(10);
    expect(AKTION_CATEGORY_LIMIT).toBe(10);
  });

  it('every seed entry has a known category and both booleans', () => {
    expect(INIT_AKTIONEN.length).toBeGreaterThan(0);
    for (const a of INIT_AKTIONEN) {
      expect(KNOWN_CATEGORIES).toContain(a.category);
      expect(typeof a.activeInCategory).toBe('boolean');
      expect(typeof a.activeOnHome).toBe('boolean');
      expect(a.id).toBeTruthy();
    }
  });

  it('carries the former promo banner as a home-active Aktion', () => {
    const home = INIT_AKTIONEN.filter(a => a.activeOnHome);
    expect(home.length).toBeGreaterThanOrEqual(1);
    expect(home.every(a => a.activeInCategory)).toBe(true);
  });

  it('adds navAktionen to the landing content default', () => {
    expect(INIT_LANDING_CONTENT.navAktionen).toBe('Aktionen');
  });
});
```

- [ ] **Step 2: Check whether a unit-test runner exists**

Run: `cat package.json | grep -E '"test"|vitest|jest'`
If **no** runner is configured: skip the `.test.ts` files in Task 1 & 2, delete `src/lib/aktion.test.ts`, and instead verify the helpers through the Task 15 Playwright specs plus `npx tsc --noEmit`. Note the decision in the commit message. If vitest/jest **is** present, continue.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/lib/aktion.test.ts`
Expected: FAIL — `INIT_AKTIONEN` / `AKTION_HOME_LIMIT` not exported.

- [ ] **Step 4: Add the type and constants in `data.ts`**

After the existing `Campaign` type (line ~6) add:

```ts
/**
 * Unified offer model — replaces the homepage `PromoBanner` and the per-category
 * `Campaign`. `category` is mandatory. `activeInCategory` gates the category
 * page + /aktionen; the homepage additionally needs `activeOnHome`.
 * startDate/endDate are display-only ('YYYY-MM-DD'); endDate also drives the
 * last-10-days countdown. No auto-hide after endDate.
 */
export type Aktion = {
  id: string;
  category: string;            // CATEGORIES[].id — 'laser' | 'gesicht' | 'mani' | 'cat-*'
  label: string; title: string; desc: string;
  price: string; oldPrice?: string;
  cta: string; icon: string; image: string; imagePosition?: ImagePosition;
  startDate?: string; endDate?: string;
  activeInCategory: boolean;
  activeOnHome: boolean;
};

export const AKTION_HOME_LIMIT = 10;     // sum across all categories, on the homepage
export const AKTION_CATEGORY_LIMIT = 10; // per category
```

- [ ] **Step 5: Add `INIT_AKTIONEN` in `data.ts`**

Immediately after `INIT_CAMPAIGNS` (line ~63). Merge the three seed campaigns + the one seed promo banner:

```ts
const a = (
  id: string, category: string, label: string, title: string, desc: string,
  price: string, oldPrice: string,
  activeInCategory: boolean, activeOnHome: boolean,
  cta = 'JETZT BUCHEN', icon = 'auto_fix_high', image = '',
): Aktion => ({
  id, category, label, title, desc, price,
  oldPrice: oldPrice || undefined,
  cta, icon, image, activeInCategory, activeOnHome,
});

export const INIT_AKTIONEN: Aktion[] = [
  a('cl1', 'laser',   'AKTIVE AKTION', 'Winter Glow Kombi-Paket', 'Ganzes Gesicht + Dekolleté inkl. Maske.', '120,00€', '149,00€', true, false, 'JETZT BUCHEN', 'auto_awesome'),
  a('cg1', 'gesicht', 'BESTSELLER',    'HydraFacial Duo-Paket',   '2× HydraFacial Premium zum Sonderpreis.', '249,00€', '298,00€', true, false, 'JETZT BUCHEN', 'spa'),
  a('cm1', 'mani',    'DUO DEAL',      'Mani & Pedi Paket',       'Gel-Maniküre + Spa-Pediküre zusammen.',   '99,00€',  '130,00€', true, false, 'JETZT BUCHEN', 'favorite'),
  // former homepage promo banner (promo1) — home-active, category best-guess 'gesicht'
  a('promo1', 'gesicht', 'EXKLUSIVES ANGEBOT', 'Winter Glow\nKombi-Paket',
    'Erhalten Sie 20 % Rabatt auf unsere exklusive Kombination aus Gesichtshydrierung und Maniküre. Gültig bis Ende der Saison.',
    '', '', true, true, 'ANGEBOT SICHERN', 'auto_awesome', '/images/promo-winter-glow.png'),
];
```

- [ ] **Step 6: Add `navAktionen` to `LandingContent` + `INIT_LANDING_CONTENT`**

In the `LandingContent` type, on the nav line (line ~105) add `navAktionen: string;`:
```ts
navBehandlungen: string; navPreise: string; navUeberUns: string; navKontakt: string; navCta: string; navAktionen: string;
```
In `INIT_LANDING_CONTENT` (line ~115) add `navAktionen: 'Aktionen',` next to the other nav defaults.

- [ ] **Step 7: Extend the `SiteContent` type**

Find the `SiteContent` type in `data.ts` (search `export type SiteContent`). Add `aktionen?: Aktion[];`. Keep `campaigns?` and `promoBanners?` but prefix each with a `/** @deprecated migrated to `aktionen` — kept one release for the 0023 migration window */` comment.

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/lib/aktion.test.ts`
Expected: PASS. Also run `npx tsc --noEmit` — expect errors only in files that still reference the old model (fixed in later tasks); note them, do not fix here.

- [ ] **Step 9: Commit**

```bash
git add src/app/[locale]/admin/behandlungen/data.ts src/lib/aktion.test.ts
git commit -m "feat: add unified Aktion type, limits and seed data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `src/lib/aktion.ts` — helpers

**Files:**
- Create: `src/lib/aktion.ts`
- Test: `src/lib/aktion.test.ts` (extend)

**Interfaces:**
- Consumes: `Aktion`, `SiteContent`, `INIT_AKTIONEN`, `AKTION_HOME_LIMIT`, `AKTION_CATEGORY_LIMIT` from `data.ts`.
- Produces:
  - `countdownLabel(endDate?: string, now?: Date): string | null`
  - `validityText(startDate?: string, endDate?: string): string | null`
  - `deriveAktionen(c: Pick<SiteContent, 'aktionen' | 'campaigns' | 'promoBanners'>): Aktion[]`
  - `homeAktionen(list: Aktion[]): Aktion[]` — `activeInCategory && activeOnHome`, capped at `AKTION_HOME_LIMIT`
  - `categoryAktionen(list: Aktion[], catId: string): Aktion[]` — `category === catId && activeInCategory`, capped at `AKTION_CATEGORY_LIMIT`
  - `visibleAktionen(list: Aktion[]): Aktion[]` — `activeInCategory` (for `/aktionen`)

- [ ] **Step 1: Write the failing tests** (append to `src/lib/aktion.test.ts`)

```ts
import { countdownLabel, validityText, deriveAktionen, homeAktionen, categoryAktionen } from '@/lib/aktion';

describe('countdownLabel', () => {
  const base = new Date('2026-09-07T09:00:00');
  it('returns null with no endDate', () => expect(countdownLabel(undefined, base)).toBeNull());
  it('returns null when more than 10 days out', () => expect(countdownLabel('2026-09-30', base)).toBeNull());
  it('counts down inside the 10-day window', () => expect(countdownLabel('2026-09-12', base)).toBe('Noch 5 Tage'));
  it('uses singular on the last full day', () => expect(countdownLabel('2026-09-08', base)).toBe('Noch 1 Tag'));
  it('says "Endet heute" on the end day', () => expect(countdownLabel('2026-09-07', base)).toBe('Endet heute'));
  it('says "Abgelaufen" once past', () => expect(countdownLabel('2026-09-01', base)).toBe('Abgelaufen'));
});

describe('validityText', () => {
  it('formats a range', () => expect(validityText('2026-09-01', '2026-09-30')).toBe('Gültig 01.09.2026–30.09.2026'));
  it('formats end only', () => expect(validityText(undefined, '2026-09-30')).toBe('Gültig bis 30.09.2026'));
  it('formats start only', () => expect(validityText('2026-09-01', undefined)).toBe('Gültig ab 01.09.2026'));
  it('returns null with no dates', () => expect(validityText()).toBeNull());
});

describe('deriveAktionen', () => {
  it('passes through an existing aktionen array', () => {
    const arr = [{ id: 'x', category: 'laser', label: '', title: 'T', desc: '', price: '', cta: '', icon: '', image: '', activeInCategory: true, activeOnHome: false }];
    expect(deriveAktionen({ aktionen: arr })).toBe(arr);
  });
  it('maps legacy campaigns (active -> activeInCategory, never home)', () => {
    const out = deriveAktionen({ campaigns: { laser: [{ id: 'c1', label: 'L', title: 'T', desc: 'D', price: '10€', cta: 'GO', icon: 'i', image: '', active: true }] } });
    expect(out).toEqual([expect.objectContaining({ id: 'c1', category: 'laser', activeInCategory: true, activeOnHome: false })]);
  });
  it('maps legacy promo banners to home-active laser Aktionen', () => {
    const out = deriveAktionen({ promoBanners: [{ id: 'p1', label: 'L', title: 'T', desc: 'D', ctaPrimary: 'GO', ctaSecondary: '', image: '/x.png' }] });
    expect(out[0]).toEqual(expect.objectContaining({ id: 'p1', category: 'laser', cta: 'GO', activeInCategory: true, activeOnHome: true }));
  });
});

describe('selectors', () => {
  const list = [
    { id: '1', category: 'laser', activeInCategory: true, activeOnHome: true },
    { id: '2', category: 'laser', activeInCategory: true, activeOnHome: false },
    { id: '3', category: 'laser', activeInCategory: false, activeOnHome: true },
    { id: '4', category: 'mani', activeInCategory: true, activeOnHome: true },
  ] as any[];
  it('homeAktionen needs both flags', () => expect(homeAktionen(list).map(a => a.id)).toEqual(['1', '4']));
  it('categoryAktionen filters by category + activeInCategory', () => expect(categoryAktionen(list, 'laser').map(a => a.id)).toEqual(['1', '2']));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/aktion.test.ts`
Expected: FAIL — module `@/lib/aktion` not found.

- [ ] **Step 3: Implement `src/lib/aktion.ts`**

```ts
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
export function resolveAktionen(c: Pick<SiteContent, 'aktionen' | 'campaigns' | 'promoBanners'>): Aktion[] {
  const derived = deriveAktionen(c);
  return derived.length ? derived : INIT_AKTIONEN;
}

export function homeAktionen(list: Aktion[]): Aktion[] {
  return list.filter(a => a.activeInCategory && a.activeOnHome).slice(0, AKTION_HOME_LIMIT);
}

export function categoryAktionen(list: Aktion[], catId: string): Aktion[] {
  return list.filter(a => a.category === catId && a.activeInCategory).slice(0, AKTION_CATEGORY_LIMIT);
}

/** Everything eligible for the public /aktionen page. */
export function visibleAktionen(list: Aktion[]): Aktion[] {
  return list.filter(a => a.activeInCategory);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/aktion.test.ts`
Expected: PASS (all describe blocks).

- [ ] **Step 5: Commit**

```bash
git add src/lib/aktion.ts src/lib/aktion.test.ts
git commit -m "feat: Aktion helpers — countdown, validity text, legacy derivation, selectors

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `useAktionen` hook + retire the two old hooks

**Files:**
- Create: `src/hooks/useAktionen.ts`
- Delete: `src/hooks/useAdminCampaigns.ts`, `src/hooks/useAdminPromoBanners.ts`
- Modify: every importer of those two (find in Step 2)

**Interfaces:**
- Consumes: `useSiteContent()` → `SiteContent`; `resolveAktionen`, `homeAktionen`, `categoryAktionen`, `visibleAktionen` from `@/lib/aktion`.
- Produces:
  - `useAktionen(): Aktion[]` — all resolved aktionen (already legacy-safe + seed fallback)
  - re-exports `homeAktionen`, `categoryAktionen`, `visibleAktionen` for convenience.

- [ ] **Step 1: Write the hook**

```ts
'use client';
import { useSiteContent } from '@/context/SiteContentContext';
import { resolveAktionen } from '@/lib/aktion';
import type { Aktion } from '@/app/[locale]/admin/behandlungen/data';

export { homeAktionen, categoryAktionen, visibleAktionen } from '@/lib/aktion';

/** All resolved Aktionen (legacy-safe, falls back to INIT_AKTIONEN). */
export function useAktionen(): Aktion[] {
  return resolveAktionen(useSiteContent());
}
```

- [ ] **Step 2: Find the old importers**

Run: `grep -rn "useAdminCampaigns\|useAdminPromoBanners\|resolveCampaigns" src/`
Expected importers (confirm): `src/components/ServicePageTemplate.tsx`, `src/app/[locale]/page.tsx`. Any `[slug]` service page. Note each — they are rewired in Tasks 9/11/12; for now just make the project compile.

- [ ] **Step 3: Delete the old hook files**

```bash
git rm src/hooks/useAdminCampaigns.ts src/hooks/useAdminPromoBanners.ts
```

- [ ] **Step 4: Temporary compile shim in the importers**

In each importer found in Step 2, replace the removed import with `import { useAktionen, categoryAktionen, homeAktionen } from '@/hooks/useAktionen';` and, at each old call site, substitute the minimal equivalent so the file type-checks (full JSX redesign happens in the later task for that file):
- `useAdminPromoBanners()` → `homeAktionen(useAktionen())`
- `useAdminCampaigns(catId)` → `categoryAktionen(useAktionen(), catId)`
- delete any `resolveCampaigns(...)` wrapper call, use the list directly.

- [ ] **Step 5: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors about `useAdminCampaigns` / `useAdminPromoBanners`. Field-shape errors inside `page.tsx` / `ServicePageTemplate.tsx` are expected if the JSX still reads `banner.ctaPrimary` etc. — fix those minimally to compile (map to `.cta`), leave the visual redesign for Tasks 11/12.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: replace useAdminCampaigns/useAdminPromoBanners with useAktionen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `/api/content` accepts `aktionen`

**Files:**
- Modify: `src/app/api/content/route.ts:14-17`

**Interfaces:**
- Produces: `KEYS` now includes `'aktionen'`; legacy `'campaigns'`/`'promoBanners'` stay tolerated (a pre-migration draft must still publish).

- [ ] **Step 1: Edit `KEYS`**

```ts
const KEYS: (keyof SiteContent)[] = [
  'services', 'aktionen', 'settings', 'landingContent',
  'heroSlides', 'aboutValues', 'reviews',
  // tolerated during the 0023 migration window — no longer written by the admin
  'campaigns', 'promoBanners',
];
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit` — expect no new errors in this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/content/route.ts
git commit -m "feat: accept aktionen in the site_content write path

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `AdminDataContext` — `aktionen` state replaces `campaigns` map + `promoBanners`

**Files:**
- Modify: `src/app/[locale]/admin/behandlungen/AdminDataContext.tsx`

**Interfaces:**
- Consumes: `Aktion`, `INIT_AKTIONEN`, `AKTION_HOME_LIMIT`, `AKTION_CATEGORY_LIMIT` from `data.ts`; `deriveAktionen` from `@/lib/aktion`.
- Produces on the context value:
  - `aktionen: Aktion[]`
  - `updateAktion(id: string, field: keyof Aktion, value: string | boolean): void`
  - `addAktion(category: string): void` — no-op if that category already has `AKTION_CATEGORY_LIMIT`
  - `removeAktion(id: string): void`
  - **Removed:** `campaigns`, `updateCampaign`, `deleteCampaign`, `addCampaign`, `promoBanners`, `updatePromoBanner`, `addPromoBanner`, `removePromoBanner`.
- The debounced write-through bundle now sends `aktionen` (not `campaigns`/`promoBanners`).

> Read the whole file first (631 lines). It has careful "seed from draft, never clobber with fresh-mount defaults" logic — preserve that structure exactly, only swapping the campaigns/promo pieces for aktionen.

- [ ] **Step 1: Imports + type aliases**

- In the `data.ts` import block: remove `INIT_CAMPAIGNS`, `INIT_PROMO_BANNERS`, `PROMO_BANNER_LIMIT`, `type Campaign`, `type PromoBanner`; add `INIT_AKTIONEN`, `AKTION_CATEGORY_LIMIT`, `type Aktion`.
- Add `import { deriveAktionen } from '@/lib/aktion';`
- Delete `type CampaignsMap = Record<string, Campaign[]>;` (line 13).
- Change key const: replace `LS_CMP` and `LS_PROMO` with `const LS_AKT = 'epilisse_admin_aktionen';`

- [ ] **Step 2: Defaults + state**

- Delete `defaultCampaigns` (lines ~39-40).
- Replace the `campaigns` state (line 109) and the `promoBanners` state (line 125) with a single:
  ```ts
  const [aktionen, setAktionen] = useState<Aktion[]>(() => INIT_AKTIONEN.map(a => ({ ...a })));
  ```
- In the `defaultPageContent`/other `defaultServices` neighbours, leave services untouched.

- [ ] **Step 3: Load effect (`useEffect` at line ~129)**

- Remove `const cmps = ls.read<CampaignsMap>(LS_CMP);` and `const promo = ls.read<PromoBanner[]>(LS_PROMO);` and their `if (cmps) …` / `if (promo …) …` setters.
- Add:
  ```ts
  const akt = ls.read<Aktion[]>(LS_AKT);
  if (akt && akt.length > 0) setAktionen(akt);
  ```
- In `hasLocalSite`, replace `cmps`/`promo` with `akt`.
- In the `/api/content?content=draft` branch, replace the `d.campaigns` / `d.promoBanners` setters with:
  ```ts
  const derived = deriveAktionen(d);
  if (derived.length > 0) setAktionen(derived);
  ```
  (`deriveAktionen` handles a draft that still has the old keys as well as one already on `aktionen`.)

- [ ] **Step 4: Write-through bundle (`useEffect` at line ~307)**

```ts
const bundle: SiteContent = {
  services, aktionen, settings, landingContent,
  heroSlides, aboutValues, reviews,
};
```
Update the dependency array: swap `campaigns, promoBanners` for `aktionen`.

- [ ] **Step 5: Replace the Campaigns + Promo callback blocks**

Delete the `/* ── Campaigns ── */` block (lines ~342-359) and the `/* ── Promo banners ── */` block (lines ~546-565). In their place:

```ts
/* ── Aktionen ─────────────────────────────────────── */
const updateAktion = useCallback((id: string, field: keyof Aktion, value: string | boolean) =>
  setAktionen(prev => {
    const next = prev.map(a => a.id === id ? { ...a, [field]: value } : a);
    ls.write(LS_AKT, next); return next;
  }), []);

const addAktion = useCallback((category: string) =>
  setAktionen(prev => {
    if (prev.filter(a => a.category === category).length >= AKTION_CATEGORY_LIMIT) return prev;
    const next: Aktion[] = [...prev, {
      id: `akt-${Date.now()}`, category,
      label: '', title: '', desc: '', price: '', oldPrice: undefined,
      cta: 'JETZT BUCHEN', icon: 'auto_fix_high', image: '', imagePosition: 'top',
      startDate: undefined, endDate: undefined,
      activeInCategory: true, activeOnHome: false,
    }];
    ls.write(LS_AKT, next); return next;
  }), []);

const removeAktion = useCallback((id: string) =>
  setAktionen(prev => {
    const next = prev.filter(a => a.id !== id);
    ls.write(LS_AKT, next); return next;
  }), []);
```

- [ ] **Step 6: `addCategory` / `deleteCategory` cleanup**

- In `addCategory` (line ~400): replace the `templateCmps` / `setCampaigns` clone block (lines ~452-459) with:
  ```ts
  const templateAkt = templateCatId ? aktionen.filter(a => a.category === templateCatId) : [];
  // …later, alongside the other seeders:
  if (templateAkt.length > 0) {
    setAktionen(prev => {
      const cloned = templateAkt.map((a, i) => ({ ...a, id: `akt-${Date.now()}-${i}`, category: id }));
      const next = [...prev, ...cloned];
      ls.write(LS_AKT, next); return next;
    });
  }
  ```
  Update the `useCallback` dep array of `addCategory`: swap `campaigns` for `aktionen`.
- In `deleteCategory` (line ~468): replace the `setCampaigns` drop block with:
  ```ts
  setAktionen(prev => {
    const next = prev.filter(a => a.category !== id);
    if (next.length === prev.length) return prev;
    ls.write(LS_AKT, next); return next;
  });
  ```

- [ ] **Step 7: Context type + provider value**

- In `interface AdminDataCtx`: remove the `campaigns`, `updateCampaign`, `deleteCampaign`, `addCampaign`, `promoBanners`, `updatePromoBanner`, `addPromoBanner`, `removePromoBanner` members. Add:
  ```ts
  aktionen: Aktion[];
  updateAktion: (id: string, field: keyof Aktion, value: string | boolean) => void;
  addAktion: (category: string) => void;
  removeAktion: (id: string) => void;
  ```
- In the `<Ctx.Provider value={{ … }}>` object (line ~609): drop the removed names, add `aktionen, updateAktion, addAktion, removeAktion`.

- [ ] **Step 8: Verify compile**

Run: `npx tsc --noEmit`
Expected: errors now only in `[categoryId]/page.tsx`, `startseite/page.tsx`, `ServicePageTemplate.tsx`, `page.tsx` (consumers, fixed next). No errors inside `AdminDataContext.tsx`.

- [ ] **Step 9: Commit**

```bash
git add src/app/[locale]/admin/behandlungen/AdminDataContext.tsx
git commit -m "refactor: AdminDataContext holds one aktionen array

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Admin nav — "Aktionen" entry

**Files:**
- Modify: `src/app/[locale]/admin/layout.tsx:9-17`

**Interfaces:**
- Produces: a `/admin/aktionen` nav item (icon `sell`, label `Aktionen`), placed right after `Behandlungen`.

- [ ] **Step 1: Add the nav item**

In `NAV_ITEMS`, after the `behandlungen` line:
```ts
  { href: '/admin/aktionen', icon: 'sell', label: 'Aktionen' },
```
(Keep the separate existing `/admin/kampagnen` "Kampagnen" item — that is the e-mail campaign feature, unrelated.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/layout.tsx
git commit -m "feat: Aktionen entry in the admin sidebar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: `/admin/aktionen` — central management page

**Files:**
- Create: `src/app/[locale]/admin/aktionen/page.tsx`
- Reference for patterns: `src/app/[locale]/admin/startseite/page.tsx` (layout, ImageUpload, save button), `src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx` (campaign card markup).

**Interfaces:**
- Consumes: `useAdminData()` → `{ aktionen, categories, updateAktion, addAktion, removeAktion }`; `AKTION_CATEGORY_LIMIT`, `AKTION_HOME_LIMIT` from `data.ts`; `countdownLabel`, `validityText` from `@/lib/aktion`; `ImageUpload` (find its import path in `[categoryId]/page.tsx`).
- Produces: the route `/admin/aktionen`.

- [ ] **Step 1: Scaffold the page (client component)**

```tsx
'use client';
import { useMemo, useState } from 'react';
import { useAdminData } from '../behandlungen/AdminDataContext';
import { AKTION_CATEGORY_LIMIT, AKTION_HOME_LIMIT, type Aktion } from '../behandlungen/data';
import { validityText, countdownLabel } from '@/lib/aktion';
import ImageUpload from '../behandlungen/[categoryId]/ImageUpload'; // adjust to the real path from Step 0

export default function AdminAktionenPage() {
  const { aktionen, categories, updateAktion, addAktion, removeAktion } = useAdminData();
  const [openCat, setOpenCat] = useState<string>('');

  const homeCount = useMemo(
    () => aktionen.filter(a => a.activeInCategory && a.activeOnHome).length,
    [aktionen],
  );

  return (
    <div className="max-w-4xl space-y-10 pb-24">
      <header>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Aktionen</h2>
        <p className="font-body-sm text-on-surface-variant opacity-70">
          Alle Kombi-Pakete &amp; Angebote. Pro Kategorie max. {AKTION_CATEGORY_LIMIT},
          auf der Startseite max. {AKTION_HOME_LIMIT} ({homeCount} aktiv).
          Eine Aktion, die im Kategoriebereich inaktiv ist, erscheint auch auf der
          Startseite und unter /aktionen nicht.
        </p>
      </header>

      {categories.map(cat => {
        const rows = aktionen.filter(a => a.category === cat.id);
        const catFull = rows.length >= AKTION_CATEGORY_LIMIT;
        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
              <h3 className="font-headline-sm text-[18px] text-on-surface">
                {cat.name} <span className="text-outline text-[13px]">({rows.length}/{AKTION_CATEGORY_LIMIT})</span>
              </h3>
              <button
                type="button"
                disabled={catFull}
                onClick={() => addAktion(cat.id)}
                className="font-label-caps text-[11px] text-primary border-b border-primary pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + Neue Aktion
              </button>
            </div>

            {rows.length === 0 && (
              <p className="font-body-sm text-outline opacity-60">Noch keine Aktion in dieser Kategorie.</p>
            )}

            {rows.map(a => (
              <AktionCard
                key={a.id}
                a={a}
                homeLocked={!a.activeOnHome && homeCount >= AKTION_HOME_LIMIT}
                onField={(f, v) => updateAktion(a.id, f, v)}
                onRemove={() => removeAktion(a.id)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: The `AktionCard` sub-component** (same file, below the default export)

```tsx
function AktionCard({
  a, homeLocked, onField, onRemove,
}: {
  a: Aktion;
  homeLocked: boolean;
  onField: (field: keyof Aktion, value: string | boolean) => void;
  onRemove: () => void;
}) {
  const preview = validityText(a.startDate, a.endDate);
  const badge = countdownLabel(a.endDate);
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/60 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <input
          className="flex-1 font-headline-sm text-[16px] text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none"
          value={a.title}
          onChange={e => onField('title', e.target.value)}
          placeholder="Titel der Aktion *"
        />
        <button type="button" onClick={onRemove} aria-label="Aktion löschen"
          className="text-outline hover:text-error transition-colors">
          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
        </button>
      </div>

      <input
        className="w-full font-label-caps text-[10px] text-primary bg-transparent border-none focus:outline-none"
        value={a.label} onChange={e => onField('label', e.target.value)} placeholder="LABEL (z.B. AKTION)"
      />
      <textarea
        className="w-full font-body-sm text-[13px] text-on-surface-variant bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none resize-none"
        rows={2} value={a.desc} onChange={e => onField('desc', e.target.value)} placeholder="Kurzbeschreibung…"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1 border border-outline-variant px-2 py-1 w-32">
          <span className="font-label-caps text-[10px] text-primary shrink-0">Preis</span>
          <input className="w-full bg-transparent text-[14px] font-bold text-primary focus:outline-none"
            value={a.price} onChange={e => onField('price', e.target.value)} placeholder="0,00€" />
        </label>
        <label className="flex items-center gap-1 border border-outline-variant/50 px-2 py-1 w-32">
          <span className="font-label-caps text-[10px] text-outline shrink-0">Statt</span>
          <input className="w-full bg-transparent text-[13px] text-outline line-through focus:outline-none"
            value={a.oldPrice ?? ''} onChange={e => onField('oldPrice', e.target.value)} placeholder="0,00€" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2">
          Startdatum
          <input type="date" className="border border-outline-variant/50 px-2 py-1 text-[12px] focus:outline-none focus:border-primary"
            value={a.startDate ?? ''} onChange={e => onField('startDate', e.target.value)} />
        </label>
        <label className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2">
          Enddatum
          <input type="date" className="border border-outline-variant/50 px-2 py-1 text-[12px] focus:outline-none focus:border-primary"
            value={a.endDate ?? ''} onChange={e => onField('endDate', e.target.value)} />
        </label>
        {preview && <span className="font-body-sm text-[11.5px] text-outline">{preview}</span>}
        {badge && <span className="font-label-caps text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{badge}</span>}
      </div>

      <div className="flex gap-2 items-center">
        <input className="flex-1 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none"
          value={a.cta} onChange={e => onField('cta', e.target.value)} placeholder="CTA-Text (z.B. JETZT BUCHEN)" />
        <input className="w-32 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none font-mono"
          value={a.icon} onChange={e => onField('icon', e.target.value)} placeholder="Icon-Name" />
      </div>

      <ImageUpload
        value={a.image}
        onChange={(v: string) => onField('image', v)}
        position={a.imagePosition}
        onPositionChange={(p: string) => onField('imagePosition', p)}
      />

      <div className="flex flex-wrap gap-5 pt-2 border-t border-outline-variant/30">
        <Switch
          label="Im Kategoriebereich aktiv"
          checked={a.activeInCategory}
          onChange={v => {
            onField('activeInCategory', v);
            if (!v && a.activeOnHome) onField('activeOnHome', false);
          }}
        />
        <Switch
          label="Auf Startseite aktiv"
          checked={a.activeOnHome}
          disabled={!a.activeInCategory || homeLocked}
          hint={!a.activeInCategory ? 'zuerst im Kategoriebereich aktivieren' : homeLocked ? 'Startseiten-Limit erreicht' : undefined}
          onChange={v => onField('activeOnHome', v)}
        />
      </div>
    </div>
  );
}

function Switch({
  label, checked, disabled, hint, onChange,
}: {
  label: string; checked: boolean; disabled?: boolean; hint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <span className="font-body-sm text-[12px] text-on-surface">
        {label}{hint && <em className="text-outline not-italic"> — {hint}</em>}
      </span>
    </label>
  );
}
```

- [ ] **Step 0 (do first): confirm the `ImageUpload` path**

Run: `grep -rn "ImageUpload" src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx` and adjust the import in Steps 1-2 to the real location.

- [ ] **Step 3: Manual smoke check**

Start the dev server if not running (`npm run dev`), open `http://localhost:3000/de/admin/aktionen`. Verify: three category sections, "+ Neue Aktion" adds a card, the "Auf Startseite aktiv" switch is disabled until "Im Kategoriebereich aktiv" is on, deleting works. No save button needed — `AdminDataContext` autosaves to `draft`.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/aktionen/page.tsx
git commit -m "feat: central /admin/aktionen management page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Category detail page — Kampagnen editor → Aktion editor

**Files:**
- Modify: `src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx`

**Interfaces:**
- Consumes: `useAdminData()` → `{ aktionen, updateAktion, addAktion, removeAktion }` (was `campaigns`, `updateCampaign`, …).
- The section now edits only `aktionen.filter(a => a.category === catId)`; `category` is fixed (not shown as an editable field).

- [ ] **Step 1: Rewire the local helpers**

Near the top of the component (lines ~20-63): replace `campaigns: allCampaigns`, `updateCampaign: ctxUpdateCampaign`, `deleteCampaign`, `addCampaign` destructuring with `aktionen: allAktionen, updateAktion: ctxUpdateAktion, removeAktion: ctxRemoveAktion, addAktion: ctxAddAktion`. Replace:
```ts
const campaigns = allCampaigns[catId] ?? [];
```
with
```ts
const catAktionen = allAktionen.filter(a => a.category === catId);
```
Replace the `updateCampaign` / `deleteCampaign` / `addCampaign` wrappers with:
```ts
const updateAktion = (id: string, field: keyof Aktion, value: string | boolean) => ctxUpdateAktion(id, field, value);
const removeAktion = (id: string) => ctxRemoveAktion(id);
const addAktion = () => ctxAddAktion(catId);
```
Delete the `EMPTY_CAMPAIGN` const and the `newCmp` / `addCmpOpen` state + the inline "add form" JSX block (lines ~490-560) — creation is now one click via `addAktion()` (a blank card appears, edited in place, matching `/admin/aktionen`).

- [ ] **Step 2: Rewrite the section body**

Replace the `{/* Campaigns … */}` `<section>` (lines ~379-565) so it maps `catAktionen`. Reuse the `AktionCard` + `Switch` components — **extract them from Task 7 into `src/app/[locale]/admin/aktionen/AktionCard.tsx`** and import in both places (do this extraction now; update Task 7's file to import from there too). Header text: `Aktionen` (was `Kampagnen`). "+ Hinzufügen" calls `addAktion()`, disabled when `catAktionen.length >= AKTION_CATEGORY_LIMIT`. Pass `homeLocked` computed from the full `allAktionen` list.

- [ ] **Step 3: Verify compile + smoke**

Run: `npx tsc --noEmit`. Open `/de/admin/behandlungen/laser` — the Aktionen section shows the laser Aktion, dates + both switches present, category not editable.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/aktionen/ src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx
git commit -m "feat: edit Aktionen (dates + dual toggles) on the category detail page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: `/admin/startseite` — remove the "Kombi-Angebot" tab

**Files:**
- Modify: `src/app/[locale]/admin/startseite/page.tsx`
- Modify: `src/app/[locale]/admin/einstellungen/page.tsx:301-305`

**Interfaces:**
- `SECTIONS` no longer contains `'Kombi-Angebot'`; the corresponding `{active === 'Kombi-Angebot' && (…)}` block is deleted; `PROMO_BANNER_LIMIT` import removed.

- [ ] **Step 1: Edit `startseite/page.tsx`**

- Line 7: remove `'Kombi-Angebot'` from `SECTIONS`.
- Line 5: drop `PROMO_BANNER_LIMIT` from the `data` import.
- Delete the whole `{active === 'Kombi-Angebot' && ( … )}` block (lines ~312-… to its closing `)}`), and any now-unused `promoBanners` / `updatePromoBanner` / `addPromoBanner` / `removePromoBanner` from the `useAdminData()` destructure.
- In the section that renders an intro/help area (top of the file), add one line of copy:
  ```tsx
  {/* promo banners moved to /admin/aktionen */}
  ```
  and, if there is a visible sections list/legend, a short note: `Kombi-Pakete &amp; Angebote pflegen Sie jetzt unter „Aktionen".`

- [ ] **Step 2: Edit `einstellungen/page.tsx`**

Lines ~301-305: change the sentence that says "Hero-Slider- und Kombi-Angebot-Bilder werden jetzt pro Eintrag unter Startseite gepflegt." to "Hero-Slider-Bilder pro Eintrag unter Startseite, Aktions-Bilder unter Aktionen."

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit` — no references left to `PROMO_BANNER_LIMIT` / `promoBanners` in these files.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/startseite/page.tsx src/app/[locale]/admin/einstellungen/page.tsx
git commit -m "refactor: drop the Kombi-Angebot tab, point to /admin/aktionen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Homepage banner redesign (Editorial Split, Variant A)

**Files:**
- Modify: `src/app/[locale]/page.tsx` — the `PROMO — Kombi-Paket` `<section id="preise">` (lines ~561-628) and the nav (desktop line ~213, mobile array line ~271, footer array line ~838/878).

**Interfaces:**
- Consumes: `useAktionen`, `homeAktionen` from `@/hooks/useAktionen`; `countdownLabel`, `validityText` from `@/lib/aktion`; existing `booking.open()`, `SmartImage`, `lc` (landing content).
- The section maps `homeAktionen(useAktionen())`; keeps `id="preise"` and one child `<div>` per banner (the E2E selector `#preise > div` still works).

- [ ] **Step 1: Data source**

Near the other hook calls at the top of the component, replace whatever `promoBanners` binding Task 3 left with:
```ts
const aktionenList = useAktionen();
const banners = homeAktionen(aktionenList);
```

- [ ] **Step 2: Replace the section markup**

```tsx
{/* ══ PROMO — Aktion / Kombi-Paket (Editorial Split, ~200px) ══ */}
<section
  id="preise"
  className="mb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto space-y-6"
>
  {banners.map((b) => {
    const badge = countdownLabel(b.endDate);
    const valid = validityText(b.startDate, b.endDate);
    return (
      <motion.div
        key={b.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative grid md:grid-cols-[1.5fr_1fr] min-h-[200px] overflow-hidden rounded-[14px] border border-outline-variant/40 bg-surface-container shadow-[0_18px_40px_-24px_rgba(80,30,45,0.35)]"
      >
        {badge && (
          <span className="absolute top-3.5 right-4 z-20 inline-flex items-center gap-1 font-label-caps text-[10px] tracking-wide text-primary bg-primary/12 border border-primary/25 rounded-full px-2.5 py-1">
            <span className="material-symbols-outlined text-[13px]">schedule</span>{badge}
          </span>
        )}

        {/* text */}
        <div className="flex flex-col justify-center gap-2 border-l-[3px] border-primary px-7 py-6 md:px-9 order-2 md:order-1">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.22em]">
            {b.label || 'Exklusives Angebot'}
          </span>
          <h2 className="font-display-lg text-[22px] md:text-[24px] leading-tight text-on-surface text-balance whitespace-pre-line max-w-[22ch]">
            {b.title}
          </h2>
          {b.desc && (
            <p className="font-body-sm text-body-sm text-secondary max-w-[46ch] line-clamp-1">{b.desc}</p>
          )}
          {valid && <span className="font-body-sm text-[11.5px] text-on-surface-variant opacity-80">{valid}</span>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1">
            {b.price && (
              <span className="flex items-baseline gap-2">
                {b.oldPrice && (
                  <span className="font-body-sm text-[14px] text-on-surface-variant line-through">{b.oldPrice}</span>
                )}
                <span className="font-body-lg text-[22px] font-bold text-primary">{b.price}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => booking.open()}
              className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all rounded-[var(--radius-cta)]"
            >
              {b.cta || 'Angebot sichern'}
            </button>
          </div>
        </div>

        {/* image */}
        <div className="relative min-h-[120px] md:min-h-full overflow-hidden order-1 md:order-2 bg-secondary-container/40">
          {b.image && (
            <SmartImage
              src={b.image}
              alt={b.title}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className={`brand-photo object-cover w-full h-full ${
                b.imagePosition === 'bottom' ? 'object-bottom' : b.imagePosition === 'center' ? 'object-center' : 'object-top'
              }`}
              sizes="(min-width:768px) 40vw, 100vw"
            />
          )}
        </div>
      </motion.div>
    );
  })}
</section>
```
(If `text-balance` / `line-clamp-1` utilities aren't enabled in this Tailwind setup, use the existing equivalents already in the file — check how other headings do `text-wrap: balance`.)

- [ ] **Step 3: Nav link "Aktionen"**

- Desktop nav (after the `/preise` `<Link>` at line ~216):
  ```tsx
  <Link href="/aktionen" className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">
    {lc.navAktionen || t("nav.aktionen")}
  </Link>
  ```
- Mobile nav array (line ~271) and both footer arrays (lines ~838, ~878): add `{ href: "/aktionen", label: lc.navAktionen || t("nav.aktionen"), internal: true }` after the `/preise` entry.

- [ ] **Step 4: Verify + look once**

Run: `npx tsc --noEmit`. Open `/de` — banner is ~200px, panel visibly distinct from the page, price pill + single CTA on one row, validity line above them, countdown chip only when an `endDate` is within 10 days (set one on a laser Aktion via `/de/admin/aktionen` to check). One screenshot, one round of fixes, move on.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: compact Editorial Split homepage Aktion banner + /aktionen nav link

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: `ServicePageTemplate` — category Aktionen + dates/countdown + nav link

**Files:**
- Modify: `src/components/ServicePageTemplate.tsx`

**Interfaces:**
- Consumes: `useAktionen`, `categoryAktionen`; `countdownLabel`, `validityText`.
- The component's own `Campaign` interface (line ~21) gains `startDate?`, `endDate?`. The page maps `categoryAktionen(useAktionen(), catId)` (or the parent already passes it — check how `data.campaigns` is currently supplied and swap the source).

- [ ] **Step 1: Widen the local `Campaign` interface**

Add `startDate?: string; endDate?: string;` to the `Campaign` interface (line ~21) and to the `toFrontend`-style mapper if one feeds it (Task 3 removed `useAdminCampaigns`; wherever `data.campaigns` originates now, pass `categoryAktionen(...)` mapped to this shape including the two dates).

- [ ] **Step 2: Render validity + countdown on the banner treatment**

In the big-banner block (around the `banner.price` / "Aktionspreis" markup at lines ~330-341) add, near the label:
```tsx
{(() => { const c = countdownLabel(banner.endDate); return c ? (
  <span className="font-label-caps text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{c}</span>
) : null; })()}
{validityText(banner.startDate, banner.endDate) && (
  <span className="block font-body-sm text-[11px] text-on-surface-variant opacity-80 mt-1">
    {validityText(banner.startDate, banner.endDate)}
  </span>
)}
```
And the same countdown chip in the "WEITERE ANGEBOTE" card block (lines ~397-402).

- [ ] **Step 3: Nav link**

In the `navLinks`-style array (line ~94-97) add `{ href: "/aktionen", label: lc.navAktionen || "Aktionen" }` after the `/preise` entry.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`. Open `/de/laser-haarentfernung` — the category Aktion shows, with the validity line; set an `endDate` within 10 days in admin and confirm the chip appears.

- [ ] **Step 5: Commit**

```bash
git add src/components/ServicePageTemplate.tsx
git commit -m "feat: show Aktion validity + countdown on category pages, add nav link

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: Public `/aktionen` page + remaining nav links + i18n + sitemap

**Files:**
- Create: `src/app/[locale]/aktionen/page.tsx`
- Modify: `src/app/[locale]/behandlungen/page.tsx`, `src/app/[locale]/preise/page.tsx`, `src/app/[locale]/ueber-uns/page.tsx` (nav)
- Modify: `src/i18n/messages/de.json`
- Modify: `src/app/[locale]/sitemap.ts`

**Interfaces:**
- Consumes: `useAktionen`, `visibleAktionen`; `useAdminData`-free — public hooks only; `useAdminCategories` (find how `/preise` lists categories) for grouping/labels; `countdownLabel`, `validityText`; `useBookingModal` (find its hook name from `page.tsx`).
- Produces: route `/aktionen`.

- [ ] **Step 1: Look at `/preise/page.tsx`** for the page shell (nav, container classes, footer, how it reads categories + booking modal). Mirror that shell.

- [ ] **Step 2: Build `src/app/[locale]/aktionen/page.tsx`**

```tsx
'use client';
import { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAktionen, visibleAktionen } from '@/hooks/useAktionen';
import { useAdminCategories } from '@/hooks/useAdminCategories';   // confirm name in /preise
import { useAdminLandingContent } from '@/hooks/useAdminLandingContent'; // confirm
import { useBookingModal } from '@/context/BookingModalContext';   // confirm
import { countdownLabel, validityText } from '@/lib/aktion';

export default function AktionenPage() {
  const t = useTranslations();
  const list = visibleAktionen(useAktionen());
  const categories = useAdminCategories();
  const lc = useAdminLandingContent();
  const booking = useBookingModal();

  const groups = useMemo(
    () => categories
      .map(c => ({ cat: c, items: list.filter(a => a.category === c.id) }))
      .filter(g => g.items.length > 0),
    [categories, list],
  );

  return (
    <main className="min-h-screen bg-surface">
      {/* reuse the same <nav> block as /preise, with the /aktionen link included */}

      <section className="px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto pt-32 pb-section-gap">
        <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
          {lc.navAktionen || 'Aktionen'}
        </span>
        <h1 className="font-display-lg text-display-lg font-bold text-on-surface mb-4">
          Aktuelle Kombi-Pakete &amp; Angebote
        </h1>

        {groups.length === 0 && (
          <p className="font-body-md text-secondary">Zurzeit keine aktiven Aktionen.</p>
        )}

        {groups.map(({ cat, items }) => (
          <div key={cat.id} className="mt-12">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-5">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(a => {
                const badge = countdownLabel(a.endDate);
                const valid = validityText(a.startDate, a.endDate);
                return (
                  <article key={a.id} className="relative flex flex-col border border-outline-variant/40 rounded-[14px] bg-surface-container-lowest overflow-hidden">
                    {badge && (
                      <span className="absolute top-3 right-3 z-10 font-label-caps text-[10px] text-primary bg-primary/12 border border-primary/25 rounded-full px-2.5 py-1">
                        {badge}
                      </span>
                    )}
                    <div className="aspect-[4/3] bg-secondary-container/40 overflow-hidden">
                      {a.image && <img src={a.image} alt={a.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col gap-2 p-5 flex-1">
                      <span className="font-label-caps text-[10px] text-primary tracking-[0.18em]">{a.label || 'Aktion'}</span>
                      <h3 className="font-headline-sm text-[17px] text-on-surface whitespace-pre-line">{a.title}</h3>
                      {a.desc && <p className="font-body-sm text-body-sm text-secondary">{a.desc}</p>}
                      {valid && <span className="font-body-sm text-[11.5px] text-on-surface-variant opacity-80">{valid}</span>}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        {a.price && (
                          <span className="flex items-baseline gap-2">
                            {a.oldPrice && <span className="font-body-sm text-[13px] text-outline line-through">{a.oldPrice}</span>}
                            <span className="font-headline-sm text-[18px] text-primary font-semibold">{a.price}</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => booking.open()}
                          className="bg-primary text-on-primary px-4 py-2 font-label-caps text-[11px] tracking-widest rounded-[var(--radius-cta)] hover:bg-primary-container transition-all"
                        >
                          {a.cta || 'Jetzt buchen'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* reuse the same <footer> block as /preise */}
    </main>
  );
}

export const dynamic = 'force-dynamic';
```
Confirm the real hook names in Step 1 and fix the three "confirm" imports. Add a `metadata` export if `/preise` uses one (`export const metadata = { title: 'Aktionen — EPILISSE', description: '…' }`); if `/preise` sets metadata via `generateMetadata`, match that.

- [ ] **Step 3: Nav link in the other three public pages**

In `behandlungen/page.tsx`, `preise/page.tsx`, `ueber-uns/page.tsx`: find the nav `<Link href="/preise">` and add an identical `<Link href="/aktionen">{lc.navAktionen || t('nav.aktionen')}</Link>` right after it. Same for their footer link lists if present.

- [ ] **Step 4: i18n**

In `src/i18n/messages/de.json`, under `"nav"` add `"aktionen": "Aktionen"`. Leave `"promo"` keys in place (still referenced only by the now-removed section? — grep: `grep -rn "promo\." src/` — if nothing references them, delete the `"promo"` block).

- [ ] **Step 5: sitemap**

In `src/app/[locale]/sitemap.ts` add `/aktionen` to the static routes array, same shape as `/preise`.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` and `npm run lint`. Open `/de/aktionen` — groups per category, cards show price/validity, countdown chip when applicable, CTA opens the booking modal. Nav link present on `/`, `/preise`, `/behandlungen`, `/ueber-uns`, category pages.

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/aktionen/ src/app/[locale]/behandlungen/page.tsx src/app/[locale]/preise/page.tsx src/app/[locale]/ueber-uns/page.tsx src/i18n/messages/de.json src/app/[locale]/sitemap.ts
git commit -m "feat: public /aktionen aggregation page + nav/sitemap/i18n

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 13: SQL migration `0023_aktionen.sql`

**Files:**
- Create: `supabase/migrations/0023_aktionen.sql`

**Interfaces:**
- Transforms `site_content.draft` and `site_content.published` (single row `id = 1`): builds `aktionen` from `promoBanners` (→ `category 'laser'`, `activeInCategory true`, `activeOnHome true`, `price ''`) + `campaigns` (Record<catId, Campaign[]> → one entry each, `category = key`, `activeInCategory = active`, `activeOnHome false`), then removes the `campaigns` and `promoBanners` keys. Idempotent: a blob that already has `aktionen` is left untouched.

- [ ] **Step 1: Write the migration**

```sql
-- EPILISSE: unify homepage promo banners + per-category campaigns into one
-- `aktionen` array on site_content. See
-- docs/superpowers/specs/2026-09-07-aktionen-subsystem-design.md.
--
-- Runtime code already reads legacy keys via deriveAktionen(); this migration
-- makes the stored blobs match the new shape so the live site does not wait for
-- a fresh "Veröffentlichen". Idempotent: blobs that already carry `aktionen`
-- are skipped.

create or replace function pg_temp.epilisse_to_aktionen(blob jsonb)
returns jsonb language plpgsql as $$
declare
  result jsonb := '[]'::jsonb;
  cat text;
  cmp jsonb;
  pb jsonb;
begin
  if blob is null or jsonb_typeof(blob) <> 'object' then
    return blob;
  end if;
  if blob ? 'aktionen' then
    return blob;  -- already migrated
  end if;

  -- per-category campaigns
  if blob ? 'campaigns' and jsonb_typeof(blob->'campaigns') = 'object' then
    for cat in select jsonb_object_keys(blob->'campaigns') loop
      for cmp in select * from jsonb_array_elements(blob->'campaigns'->cat) loop
        result := result || jsonb_build_object(
          'id',    cmp->>'id',
          'category', cat,
          'label', coalesce(cmp->>'label',''),
          'title', coalesce(cmp->>'title',''),
          'desc',  coalesce(cmp->>'desc',''),
          'price', coalesce(cmp->>'price',''),
          'oldPrice', cmp->>'oldPrice',
          'cta',   coalesce(cmp->>'cta','JETZT BUCHEN'),
          'icon',  coalesce(cmp->>'icon','auto_fix_high'),
          'image', coalesce(cmp->>'image',''),
          'imagePosition', cmp->>'imagePosition',
          'activeInCategory', coalesce((cmp->>'active')::boolean, true),
          'activeOnHome', false
        );
      end loop;
    end loop;
  end if;

  -- homepage promo banners
  if blob ? 'promoBanners' and jsonb_typeof(blob->'promoBanners') = 'array' then
    for pb in select * from jsonb_array_elements(blob->'promoBanners') loop
      result := result || jsonb_build_object(
        'id',    pb->>'id',
        'category', 'laser',
        'label', coalesce(pb->>'label',''),
        'title', coalesce(pb->>'title',''),
        'desc',  coalesce(pb->>'desc',''),
        'price', '',
        'cta',   coalesce(nullif(pb->>'ctaPrimary',''),'JETZT BUCHEN'),
        'icon',  'auto_awesome',
        'image', coalesce(pb->>'image',''),
        'activeInCategory', true,
        'activeOnHome', true
      );
    end loop;
  end if;

  return (blob - 'campaigns' - 'promoBanners') || jsonb_build_object('aktionen', result);
end;
$$;

update site_content
set draft     = pg_temp.epilisse_to_aktionen(draft),
    published = pg_temp.epilisse_to_aktionen(published),
    updated_at = now()
where id = 1;
```

- [ ] **Step 2: Apply**

This project applies migrations via the Supabase dashboard SQL editor (MCP points at a sibling project — see `memory/project_categories_db_migration_2026-09-04.md`). **Do not auto-apply.** Leave a note in the commit + final report that the user must run `0023_aktionen.sql` in the `gawxgxfokekndikdlvvj` dashboard, then click "Veröffentlichen" once from a browser that holds the admin session.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0023_aktionen.sql
git commit -m "feat: migration 0023 — fold campaigns + promoBanners into aktionen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 14: E2E — `admin-aktionen-crud.spec.ts`

**Files:**
- Create: `tests/e2e/admin-aktionen-crud.spec.ts`
- Delete: `tests/e2e/admin-promo-banners-crud.spec.ts`
- Reference: `tests/e2e/helpers.ts` (`fieldInput`), existing specs for auth setup (check whether specs assume a logged-in admin storage state).

**Interfaces:**
- Consumes: the running dev/preview server with `CONTENT_PREVIEW=1` (so `draft` edits show on public pages), Playwright default fresh context per test.

- [ ] **Step 1: Check the auth precondition**

Run: `grep -rn "storageState\|admin/login\|getAdminSession\|beforeEach" tests/e2e/*.ts playwright.config.*`
If other admin specs log in or use a `storageState`, copy that exact setup into the new spec's `test.beforeEach` / config project.

- [ ] **Step 2: Write the spec**

```ts
import { test, expect } from '@playwright/test';

// Replaces admin-promo-banners-crud.spec.ts. Covers the unified Aktion model:
// central CRUD, the two-toggle rule, the per-category limit, the /aktionen page,
// and the last-10-days countdown badge. Fresh context per test → state starts
// from INIT_AKTIONEN.

const CARD = '[data-testid="aktion-card"]';

test('create an Aktion, activate it on the homepage, see it on /de', async ({ page }) => {
  const marker = `E2E Aktion ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  // first category section
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);
  await card.getByPlaceholder('0,00€').first().fill('99,00€');
  await card.getByRole('switch', { name: 'Auf Startseite aktiv' }).click();

  await page.goto('/de');
  await expect(page.locator('#preise > div', { hasText: marker })).toBeVisible();
  await expect(page.locator('#preise > div', { hasText: marker })).toContainText('99,00€');
});

test('an Aktion inactive in its category is hidden on homepage AND /aktionen', async ({ page }) => {
  const marker = `E2E Hidden ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);
  await card.getByRole('switch', { name: 'Auf Startseite aktiv' }).click();          // home on
  await card.getByRole('switch', { name: 'Im Kategoriebereich aktiv' }).click();     // category OFF

  // home switch is now disabled and the Aktion is gone from both public surfaces
  await expect(card.getByRole('switch', { name: 'Auf Startseite aktiv' })).toBeDisabled();
  await page.goto('/de');
  await expect(page.locator('#preise', { hasText: marker })).toHaveCount(0);
  await page.goto('/de/aktionen');
  await expect(page.getByText(marker)).toHaveCount(0);
});

test('per-category limit of 10 disables "+ Neue Aktion"', async ({ page }) => {
  await page.goto('/de/admin/aktionen');
  const addFirst = page.getByRole('button', { name: '+ Neue Aktion' }).first();
  for (let i = 0; i < 12; i++) {
    if (await addFirst.isDisabled()) break;
    await addFirst.click();
  }
  await expect(addFirst).toBeDisabled();
  await expect(page.locator('text=/10\\/10/').first()).toBeVisible();
});

test('countdown badge shows inside the 10-day window', async ({ page }) => {
  const soon = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
  const far  = new Date(Date.now() + 40 * 86_400_000).toISOString().slice(0, 10);
  const marker = `E2E Countdown ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);
  await card.locator('input[type="date"]').nth(1).fill(soon);
  await expect(card.getByText('Noch 5 Tage')).toBeVisible();

  await card.locator('input[type="date"]').nth(1).fill(far);
  await expect(card.getByText(/Noch \d+ Tage/)).toHaveCount(0);
});
```

- [ ] **Step 3: Add the `data-testid` hooks**

For the selectors above to be stable, add `data-testid="aktion-card"` to the `AktionCard` root `<div>` (Task 7/8 shared component). Commit that one-line change with this task.

- [ ] **Step 4: Delete the old spec + run**

```bash
git rm tests/e2e/admin-promo-banners-crud.spec.ts
```
Run: `npx playwright test admin-aktionen-crud --reporter=line`
Expected: 4 passed. Fix selector/text mismatches against the actual rendered markup (do not weaken an assertion to make it pass).

- [ ] **Step 5: Run the whole E2E suite for regressions**

Run: `npx playwright test --reporter=line`
Expected: all green. Any spec that referenced `#preise > div` count, the "Kombi-Angebot" admin tab, or per-category "Kampagnen" needs updating to the new UI — fix those here.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/ src/app/[locale]/admin/aktionen/AktionCard.tsx
git commit -m "test: e2e for the unified Aktionen admin + public surfaces

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 15: Cleanup pass + final verification

**Files:**
- Modify: `src/app/[locale]/admin/behandlungen/data.ts` (remove dead exports), any stragglers.

- [ ] **Step 1: Hunt dead references**

Run each, expect **no hits** (or only the `@deprecated` type defs + migration comment):
```
grep -rn "PROMO_BANNER_LIMIT\|INIT_PROMO_BANNERS\|useAdminPromoBanners\|useAdminCampaigns\|resolveCampaigns" src/ tests/
grep -rn "INIT_CAMPAIGNS" src/
grep -rn "'Kombi-Angebot'\|Kombi-Angebot" src/app
```
Remove whatever is now unused. Keep `type Campaign` / `type PromoBanner` only if `deriveAktionen` / the migration-window still needs them for typing the legacy `SiteContent` keys; otherwise delete and drop the deprecated `SiteContent.campaigns` / `.promoBanners` too (then also remove them from `KEYS` in `/api/content/route.ts` — but only if migration 0023 has been confirmed applied; if not yet, leave the tolerated keys and note it).

- [ ] **Step 2: Full check**

Run:
```
npx tsc --noEmit
npm run lint
npx vitest run    (if configured)
npx playwright test --reporter=line
npm run build
```
All must pass.

- [ ] **Step 3: Manual walkthrough** (dev server, `CONTENT_PREVIEW=1`)

- `/de/admin/aktionen`: add/edit/delete in each category; both switches + rule; per-category 10 limit; homepage 10 limit disables extra home switches.
- `/de/admin/behandlungen/laser`: same Aktionen editor inline, category fixed.
- `/de/admin/startseite`: no "Kombi-Angebot" tab, note points to Aktionen.
- `/de`: compact ~200px banner, price pill, validity line, countdown chip (with a near `endDate`).
- `/de/laser-haarentfernung`: category Aktion with validity + countdown.
- `/de/aktionen`: grouped cards, filters by `activeInCategory`, CTA opens booking.
- Nav "Aktionen" link on `/`, `/preise`, `/behandlungen`, `/ueber-uns`, category pages, `/aktionen`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead promo-banner/campaign code paths

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Hand-off note**

In the final report to the user, list the two manual steps that remain:
1. Run `supabase/migrations/0023_aktionen.sql` in the Supabase dashboard (`gawxgxfokekndikdlvvj`).
2. Click **Veröffentlichen** once from a logged-in admin browser so `published` picks up the new shape.
Until then the site runs on the `deriveAktionen` code fallback (correct, just not yet persisted).

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| `Aktion` data model + limits 10 | 1 |
| Storage `site_content.aktionen` + code fallback | 2 (`deriveAktionen`), 3, 5 |
| SQL migration 0023 | 13 |
| Derived views (category / home / /aktionen) | 2 (selectors), 10, 11, 12 |
| Countdown + validity text | 2, 10, 11, 12, 7/8 (admin preview) |
| Admin `/admin/aktionen` (mandatory category, 2 toggles, limits, rule) | 6, 7, 14 |
| Category detail page editor | 8 |
| `/admin/startseite` tab removed | 9 |
| Publish flow unchanged | 4 (KEYS), inherits existing POST |
| Homepage banner redesign (Variant A, ~200px, validity before price) | 10 |
| Public `/aktionen` + nav + sitemap + i18n | 12 |
| Testing (CRUD, category-required, limit 10, two-toggle rule, /aktionen count, countdown, publish round-trip) | 14 |
| YAGNI: no auto-hide, no discounted-services aggregation, no i18n | honored — not built |

**2. Placeholder scan** — no "TBD/TODO"; every code step carries real code. Steps that say "confirm the import path" / "mirror `/preise`" are explicit investigation steps in an existing codebase, each with the exact grep to run, not deferred work.

**3. Type consistency** — `Aktion` fields identical across Tasks 1, 2, 5, 7, 13. Callback names stable: `updateAktion` / `addAktion(category)` / `removeAktion` used identically in Tasks 5, 7, 8. `homeAktionen` / `categoryAktionen` / `visibleAktionen` signatures fixed in Task 2 and consumed unchanged in 3, 10, 11, 12. `countdownLabel(endDate?, now?)` / `validityText(startDate?, endDate?)` stable throughout.

**Known follow-up (not blocking this plan):** once 0023 is applied and verified, a tiny cleanup PR removes the tolerated `campaigns`/`promoBanners` from `KEYS` and the `@deprecated` `SiteContent` members (Task 15 Step 1 already stages this if the migration is confirmed during execution).
