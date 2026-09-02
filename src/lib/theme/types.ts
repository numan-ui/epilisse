/** The colours an admin actually picks. Everything else is derived from these. */
export const THEME_FIELDS = [
  'brand', // → --color-primary (buttons, links, active state)
  'onBrand', // → --color-on-primary (text on a brand-coloured button)
  'brandHover', // → --color-primary-container (hover / pressed)
  'surface', // → --color-surface / --color-background (page)
  'card', // → --color-surface-container (cards, panels)
  'text', // → --color-on-surface (body copy, headings)
  'accent', // → --color-tertiary-container (secondary highlights, kickers)
  'heroPanel', // → hero split-panel background (light or dark)
] as const;

export type ThemeField = (typeof THEME_FIELDS)[number];
export type ThemeInput = Record<ThemeField, string>;

/** Short, human-readable label per field for the admin UI. */
export const THEME_FIELD_LABEL: Record<ThemeField, string> = {
  brand: 'Marka rengi',
  onBrand: 'Buton yazı rengi',
  brandHover: 'Buton hover',
  surface: 'Zemin tonu',
  card: 'Kart yüzeyi',
  text: 'Ana metin rengi',
  accent: 'Aksan',
  heroPanel: 'Hero panel zemini',
};

export type DeriveResult = {
  /** CSS custom-property name → value, ready for a `:root {}` block. */
  vars: Record<string, string>;
  /** Notes when a colour was auto-corrected for readability. */
  notes: string[];
};

export function isThemeInput(v: unknown): v is ThemeInput {
  if (!v || typeof v !== 'object') return false;
  return THEME_FIELDS.every((f) => typeof (v as Record<string, unknown>)[f] === 'string');
}
