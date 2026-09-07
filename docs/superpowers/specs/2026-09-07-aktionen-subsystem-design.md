# Aktionen-Subsystem — Design

Date: 2026-09-07
Status: Approved (design), pending implementation plan

## Problem

Heute gibt es zwei getrennte, inkompatible "Angebots"-Modelle:

- **Homepage `promoBanners`** (`PromoBanner`, `site_content.promoBanners`, Limit 4):
  Full-width-Banner, kein Preis, kein Datum. Gerendert in
  `src/app/[locale]/page.tsx`.
- **Kategorie-`campaigns`** (`Campaign`, `site_content.campaigns` als
  `Record<categoryId, Campaign[]>`, kein Limit): Karten mit
  `price`/`oldPrice`. Gerendert über `useAdminCampaigns` in
  `ServicePageTemplate`.

Gewünscht:

1. Homepage-Kombipakete: bis zu **10**.
2. Kategorie-Kombipakete: bis zu **10 pro Kategorie**.
3. Neue **`/aktionen`**-Seite, die **alle** Aktions-Karten aller Kategorien
   automatisch listet — mit Preis und Beschreibung. Pro Aktion ein
   Gültigkeitszeitraum (nur Anzeigetext) und in den letzten 10 Tagen ein
   Countdown-Badge. Pro Aktion zwei Aktiv/Inaktiv-Schalter (eigener
   Kategoriebereich / Startseite). Regel: in der eigenen Kategorie inaktiv ⇒
   auch auf der Startseite inaktiv. Kategorie ist ein Pflichtfeld.

Entscheidung: **die beiden Modelle zu einem `Aktion`-Modell vereinen.**

## Nicht-Ziele (YAGNI)

- Kein automatisches Ausblenden nach `endDate` — nur Anzeigetext + Countdown.
  Ablaufene Aktionen schaltet der Admin manuell ab.
- `/aktionen` aggregiert **nur Aktions-Karten**, keine rabattierten Services
  (`Service.oldPrice`).
- Keine Mehrsprachigkeit (Site ist einsprachig DE).
- Kein neues Kategorie-Objekt: "Aktion" ist eine eigenständige Seite +
  Nav-Link, das Kategoriesystem bleibt hardcodiert (siehe
  `memory/feedback_category_system_stability.md`).

## Approach (Storage) — gewählt: A

**A. Ein Array `site_content.aktionen: Aktion[]`.** Jede Aktion trägt ein
`category`-Feld. Kategorie-, Startseiten- und `/aktionen`-Ansichten werden per
Filter abgeleitet. Nutzt das bestehende `site_content` draft/publish-Plumbing
(`SiteContentContext`, `/api/content`, "Veröffentlichen") unverändert.

Verworfen:
- **B. Eigene Tabelle `site_aktionen`** mit eigenem draft/publish — vierte
  Content-Tabelle + Hook + Publish-Integration, Overengineering.
- **C. Zwei Stores behalten** und nur Felder ergänzen — widerspricht der
  Vereinigungs-Entscheidung, doppelte Pflege.

## Data model

`src/app/[locale]/admin/behandlungen/data.ts`:

```ts
export type Aktion = {
  id: string;
  category: string;          // PFLICHT — CATEGORIES[].id: 'laser' | 'gesicht' | 'mani'
  label: string; title: string; desc: string;
  price: string; oldPrice?: string;
  cta: string; icon: string; image: string; imagePosition?: ImagePosition;
  startDate?: string;        // 'YYYY-MM-DD' — reiner Anzeigetext
  endDate?: string;          // 'YYYY-MM-DD' — Anzeigetext + Countdown (letzte 10 Tage)
  activeInCategory: boolean; // Sichtbarkeit: eigene Kategorieseite + /aktionen
  activeOnHome: boolean;     // Startseite — nur wirksam wenn activeInCategory && activeOnHome
};

export const AKTION_HOME_LIMIT = 10;      // Summe über alle Kategorien, auf der Startseite
export const AKTION_CATEGORY_LIMIT = 10;  // pro Kategorie

export const INIT_AKTIONEN: Aktion[] = [ /* aus INIT_CAMPAIGNS + INIT_PROMO_BANNERS gemergt */ ];
```

- `Campaign` wird zu `Aktion` (Alias beibehalten oder Referenzen umziehen).
- `PromoBanner` + `PROMO_BANNER_LIMIT` + `INIT_PROMO_BANNERS` entfallen.
- `INIT_CAMPAIGNS` entfällt (Inhalt wandert in `INIT_AKTIONEN`).

## Storage & migration

`site_content` ist eine Single-Row-JSONB-Tabelle (`draft`/`published`).
"Migration" = Umformung des Blobs:

- Blob-Key: `promoBanners` + `campaigns` (Record) → **`aktionen: Aktion[]`**.
- **Code-Fallback (primär):** `useAktionen()` bzw. der SSR-Resolver leitet,
  falls `aktionen` fehlt, das Array aus den Legacy-Keys ab:
  - je `campaigns[catId][*]` → `{ ...c, category: catId,
    activeInCategory: c.active, activeOnHome: false }`
  - je `promoBanners[*]` → in eine Aktion überführt (`category` =
    Default `'laser'` bzw. Admin-Nachpflege), `activeInCategory: true`,
    `activeOnHome: true`, `price`/`oldPrice` leer.
  Damit funktioniert die Seite ohne DB-Änderung, identisch zur bestehenden
  "fällt auf INIT_* zurück"-Philosophie.
- **SQL-Migration `0023_aktionen.sql` (sekundär, einmalig):** transformiert
  vorhandene `draft`- und `published`-Blobs per plpgsql/`jsonb`-Bau, damit die
  Live-Seite sofort die neue Form hat, ohne auf ein erneutes "Veröffentlichen"
  zu warten. Legacy-Keys werden nach der Transformation entfernt.
- Schreibpfad (`/api/content`) schreibt künftig nur noch `aktionen`.

Die genaue Reihenfolge (erst Code-Fallback deployen, dann SQL) legt der
Implementierungsplan fest.

## Derived views

Ein Hook `useAktionen(): Aktion[]` liest `useSiteContent().aktionen`
(Fallback siehe oben). Konsumenten:

| Ansicht | Filter | Rendering |
|---|---|---|
| Kategorieseite (`ServicePageTemplate`) | `a.category === catId && a.activeInCategory`, `slice(0, AKTION_CATEGORY_LIMIT)` | **bestehendes Kartendesign**, ergänzt um Datumstext + Countdown-Badge |
| Startseite (`page.tsx`) | `a.activeInCategory && a.activeOnHome`, `slice(0, AKTION_HOME_LIMIT)` | **bestehendes Full-Width-Banner-Design bleibt**; Banner bekommt Aktionspreis-Block + Datumstext + Countdown-Badge |
| `/aktionen` (neu) | `a.activeInCategory` | Karten-Grid, nach Kategorie gruppiert, mit Kategorie-Filter-Chips |

`useAdminCampaigns` / `resolveCampaigns` / `useAdminPromoBanners` werden durch
`useAktionen` + kleine Selektoren ersetzt.

## Countdown

`src/lib/aktion.ts`:

```ts
countdownLabel(endDate?: string, now = new Date()): string | null
```

- kein `endDate` oder Restlaufzeit > 10 Tage → `null` (kein Badge)
- 1–10 Tage → `"Noch N Tage"`  (N = 1 → `"Noch 1 Tag"`)
- 0 Tage (heute) → `"Endet heute"`
- Vergangenheit → `"Abgelaufen"` (gedämpft) — **kein automatisches Ausblenden**

Datumstext (immer, wenn Datum gesetzt): `"Gültig 01.09.–30.09.2026"` /
`"Gültig bis 30.09.2026"` (nur `endDate`) / `"Gültig ab 01.09.2026"` (nur
`startDate`). Rendering: Badge in der Ecke von Karte und Banner.

## Admin

### Neu: `/admin/aktionen`

- Neuer Eintrag "Aktionen" in der Admin-Seitennavigation.
- Alle Aktionen in **einer Liste**, gruppiert nach Kategorie-Überschriften.
- "Neue Aktion" → Formular:
  - **Kategorie-Dropdown — Pflicht.** Leere Auswahl ⇒ Speichern blockiert,
    Inline-Fehlermeldung.
  - `label`, `title`, `desc`, `price` (Preis), `oldPrice` (Aktionspreis),
    `cta`, `icon`, Bild (+ `imagePosition`), `startDate`, `endDate`.
  - Zwei Switches: **"Im Kategoriebereich aktiv"** (`activeInCategory`),
    **"Auf Startseite aktiv"** (`activeOnHome`).
- Limits:
  - Pro Kategorie ≥ `AKTION_CATEGORY_LIMIT` ⇒ "Neue Aktion" für diese
    Kategorie deaktiviert + Hinweis.
  - Auf der Startseite aktive Aktionen ≥ `AKTION_HOME_LIMIT` ⇒ weitere
    `activeOnHome`-Switches deaktiviert + Hinweis.
- Regel-Durchsetzung: `activeOnHome`-Switch ist **disabled**, solange
  `activeInCategory` aus ist. Wird `activeInCategory` abgeschaltet, wird
  `activeOnHome` mit-zurückgesetzt (oder rein abgeleitet ausgewertet — der
  effektive Startseiten-Zustand ist immer `activeInCategory && activeOnHome`).

### Kategorie-Detailseite (`/admin/behandlungen/[categoryId]`)

- Bestehender "Kampagne"-Editor bleibt, umbenannt zu **"Aktionen"**.
- Zeigt/bearbeitet nur die Aktionen dieser Kategorie; `category`-Feld fix
  (nicht editierbar hier).
- Ergänzt um die neuen Felder: `startDate`, `endDate`, beide Switches, gleiche
  Limit-/Regel-Logik wie oben.

### `/admin/startseite`

- Tab **"Kombi-Angebot" entfällt**. Ersetzt durch einen kurzen Hinweistext +
  Link zu `/admin/aktionen`.

### Publish

`aktionen` ist Teil von `site_content` ⇒ der bestehende
"Veröffentlichen"-Fluss (3 Content-Tabellen) deckt es unverändert ab.

## Public `/aktionen` page + nav

- Neue Route `src/app/[locale]/aktionen/page.tsx`, SSR, Aufbau analog
  `src/app/[locale]/preise/page.tsx`.
- Inhalt: alle Aktionen mit `activeInCategory === true`, nach Kategorie
  gruppiert, Kategorie-Filter-Chips, jeweils Kartendesign mit Preis/
  Aktionspreis, Beschreibung, Datumstext, Countdown-Badge, CTA (öffnet
  Booking-Modal analog bestehender Karten).
- **Nav-Link "Aktionen"** — es gibt keinen geteilten Navbar-Komponenten,
  daher pro Datei ergänzen:
  `src/app/[locale]/page.tsx` (Desktop-Nav + Mobile-Nav + Footer),
  `src/components/ServicePageTemplate.tsx`,
  `src/app/[locale]/behandlungen/page.tsx`,
  `src/app/[locale]/preise/page.tsx`,
  `src/app/[locale]/ueber-uns/page.tsx`.
- `LandingContent.navAktionen` (Default `"Aktionen"`) in `data.ts` +
  `nav.aktionen` in `src/i18n/messages/de.json`.
- `src/app/[locale]/sitemap.ts` um `/aktionen` erweitern; einfache
  `metadata` (Title/Description) auf der Seite.

## Homepage-Banner Redesign (kompakter + ästhetischer)

Der bestehende Full-Width-Banner (`page.tsx`, `min-h-[400px]`) hat viel
vertikalen Leerraum und ein generisches Stockfoto. Gewählte Variante:
**"Editorial Split"** — das heutige Prinzip (Text links, Bild rechts) bleibt,
aber halbhoch und aufgeräumt:

- **Höhe: fix ~200px** (statt `min-h-[400px]`), Inhalt vertikal zentriert.
  Mehrere Banner untereinander mit kleinerem vertikalem Abstand.
- **Grid:** Textspalte : Bild = `1.5fr : 1fr` (≈ 60 / 40). Bild rechts
  full-bleed, `imagePosition`-Crop.
- **Panel:** eigene Fläche (`surface-container` /
  `--color-surface-container`), 1px `outline-variant`-Rand, weicher Schatten
  → Karte „schwebt". `3px`-Kante links in `primary`.
- **Textspalte, vertikal zentriert, in dieser Reihenfolge:**
  1. Label (11px, `tracking` ~.24em, uppercase, `primary`)
  2. Titel (Playfair Display, ~23px, max. 2 Zeilen, `text-wrap: balance`)
  3. Beschreibung — **eine** kurze Zeile (`text-body-sm`, `secondary`)
  4. **`Gültig bis TT.MM.JJJJ`** (bzw. Zeitraum) — eigene Zeile, ~11.5px,
     `muted` — **kommt VOR** der Preis/CTA-Zeile
  5. Fußzeile (eine Reihe, `flex-wrap`): **Aktionspreis-Pill inline**
     (alter Preis durchgestrichen ~14px `muted` + neuer Preis ~22px `bold`
     `primary`/`rose-deep`) · **eine** primäre CTA (`--radius-cta` 8px)
- **Countdown-Chip:** absolut oben rechts in der Karte, nur wenn
  `countdownLabel(endDate)` ≠ null (≤ 10 Tage). Pill: `primary`-Text auf
  `primary`/12%-Fläche, `primary`/22%-Rand.
- Ohne `oldPrice`: nur `price` (kein Strich, kein Pill-Kontrast). Ohne
  `price`: Preisblock entfällt, CTA rückt vor. Ohne Datum: Zeile 4 entfällt.
- **Mobile (`max-width: 720px`):** eine Spalte, Bild zuerst (`order: -1`,
  ~110px hoch), Text darunter, gleiche Reihenfolge.
- Referenz-Mockup: Artifact
  `https://claude.ai/code/artifact/67e59a66-bd73-4933-845e-89afc4aa5425`
  (Variante A).

Die Kategorieseiten-Karten (`ServicePageTemplate`) behalten ihr aktuelles
Kartendesign; nur Datumstext + Countdown-Badge kommen dort hinzu.

## Testing

Neuer E2E-Spec `tests/e2e/admin-aktionen-crud.spec.ts` (ersetzt
`admin-promo-banners-crud.spec.ts`):

- Aktion anlegen / bearbeiten / löschen über `/admin/aktionen`.
- **Kategorie-Pflicht:** Speichern ohne Kategorie schlägt fehl, Fehlermeldung
  sichtbar.
- **Limit 10:** 11. Aktion pro Kategorie / 11. `activeOnHome` blockiert.
- **Zwei-Switch-Regel:** `activeInCategory` aus ⇒ Aktion weder auf
  Kategorieseite noch Startseite noch `/aktionen` sichtbar; `activeOnHome`-
  Switch disabled.
- `/aktionen`-Seite: erwartete Anzahl Karten, Gruppierung, Filter-Chips.
- **Countdown:** Fixture mit festem `endDate` (z. B. heute + 5 Tage) ⇒
  `"Noch 5 Tage"` sichtbar; `endDate` > 10 Tage ⇒ kein Badge.
- Publish-Round-Trip: Draft anlegen → Veröffentlichen → öffentliche Seite
  zeigt Inhalt.

Bestehende Specs, die `promoBanners`/`campaigns` referenzieren, entsprechend
anpassen.

## Touchpoints (Datei-Checkliste)

- `src/app/[locale]/admin/behandlungen/data.ts` — `Aktion`-Typ, Limits,
  `INIT_AKTIONEN`, `navAktionen`; `PromoBanner`/`Campaign`/`INIT_CAMPAIGNS`/
  `INIT_PROMO_BANNERS` entfernen.
- `src/context/SiteContentContext.tsx` — `aktionen` im Typ + Fallback-Ableitung
  aus Legacy-Keys.
- `src/lib/content/site.ts` (SSR-Resolver) — gleiche Ableitung serverseitig.
- `src/hooks/useAktionen.ts` — neu; `useAdminCampaigns.ts` +
  `useAdminPromoBanners.ts` entfernen/umleiten.
- `src/lib/aktion.ts` — `countdownLabel` + Datumstext-Formatierung.
- `src/app/[locale]/page.tsx` — Banner-Sektion auf `useAktionen` umstellen,
  Preis/Datum/Countdown ergänzen; Banner-Redesign (kompakt, ~200px, Panel-
  Kontrast, inline Aktionspreis-Pill); Nav-Link.
- `src/components/ServicePageTemplate.tsx` — Karten auf `useAktionen` umstellen,
  Datum/Countdown ergänzen; Nav-Link.
- `src/app/[locale]/aktionen/page.tsx` — neu.
- `src/app/[locale]/admin/aktionen/page.tsx` — neu.
- `src/app/[locale]/admin/behandlungen/[categoryId]/page.tsx` — Editor auf
  `Aktion` + neue Felder.
- `src/app/[locale]/admin/behandlungen/AdminDataContext.tsx` — `aktionen`
  State/Reducer statt `campaigns` + `promoBanners`.
- `src/app/[locale]/admin/startseite/page.tsx` — "Kombi-Angebot"-Tab entfernen.
- `src/app/[locale]/admin/einstellungen/page.tsx` — Text-Referenz auf
  "Kombi-Angebot-Bilder" anpassen.
- `src/app/api/content/route.ts` — Schreib-/Validierungspfad für `aktionen`.
- `src/i18n/messages/de.json` — `nav.aktionen`, `promo.*` aufräumen.
- `src/app/[locale]/behandlungen/page.tsx`, `preise/page.tsx`,
  `ueber-uns/page.tsx` — Nav-Link.
- `src/app/[locale]/sitemap.ts` — `/aktionen`.
- `supabase/migrations/0023_aktionen.sql` — Blob-Transformation.
- `tests/e2e/admin-aktionen-crud.spec.ts` — neu; alter Promo-Spec entfällt.

## Open questions for the plan

- Genaue Formulierung / Pluralregeln der Countdown-Labels final in DE.
- `promoBanners`-Migration: welche Kategorie bekommen bestehende Banner ohne
  eindeutige Zuordnung? (Vorschlag: `'laser'` als Default, Admin pflegt nach.)
- Reihenfolge Deploy Code-Fallback vs. SQL-Migration `0023`.
