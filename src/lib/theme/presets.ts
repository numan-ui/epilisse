import type { ThemeInput } from './types';
import { THEME_FIELDS } from './types';

/**
 * "Gold Lux" — the values baked into globals.css `@theme`. This is the
 * default: while the saved theme equals this preset the site renders straight
 * from globals.css and no override `<style>` is injected.
 */
export const GOLD_LUX: ThemeInput = {
  brand: '#745B00',
  onBrand: '#FFFFFF',
  brandHover: '#C5A021',
  surface: '#FCF9F8',
  card: '#F0EDED',
  text: '#1C1B1B',
  accent: '#A3A4A4',
  heroPanel: '#1A1712',
  // No distinct CTA colour picked for this preset — booking buttons render
  // identically to nav/tabs, same as before the CTA field existed.
  ctaColor: '#745B00',
  ctaHover: '#C5A021',
};

/** "Antique Rose" — the pink-forward alternative from the palette swatches. */
export const ANTIQUE_ROSE: ThemeInput = {
  brand: '#A34E5B',
  onBrand: '#FFFFFF',
  brandHover: '#C87D87',
  surface: '#FDF6F1',
  card: '#F7E9E2',
  text: '#241A1C',
  accent: '#6B7556',
  heroPanel: '#FDF7F2',
  ctaColor: '#A34E5B',
  ctaHover: '#C87D87',
};

/**
 * "Ivory Editorial" — response to a design critique flagging the site's
 * flat single-tone ground and the fact that nav/tabs/CTA all shared one
 * colour. Off-white ground, a distinct CTA colour reserved for booking
 * actions only, and a warmer surface ramp for alternating section bands.
 */
export const IVORY_EDITORIAL: ThemeInput = {
  brand: '#8E4A5B',
  onBrand: '#FFFFFF',
  brandHover: '#C87D87',
  surface: '#FAF7F5',
  card: '#F3ECE7',
  text: '#1F1619',
  accent: '#D4AF37',
  heroPanel: '#FDF7F2',
  ctaColor: '#8C4356',
  ctaHover: '#743545',
};

export const PRESETS = {
  goldLux: GOLD_LUX,
  antiqueRose: ANTIQUE_ROSE,
  ivoryEditorial: IVORY_EDITORIAL,
} as const;

export type PresetName = keyof typeof PRESETS;

export const PRESET_LABEL: Record<PresetName, string> = {
  goldLux: 'Gold Lux',
  antiqueRose: 'Antique Rose',
  ivoryEditorial: 'Ivory Editorial',
};

/** Case-insensitive field-by-field comparison. */
export function sameTheme(a: ThemeInput, b: ThemeInput): boolean {
  return THEME_FIELDS.every(
    (f) => (a[f] ?? '').toLowerCase() === (b[f] ?? '').toLowerCase(),
  );
}

export function matchPreset(input: ThemeInput): PresetName | null {
  for (const name of Object.keys(PRESETS) as PresetName[]) {
    if (sameTheme(input, PRESETS[name])) return name;
  }
  return null;
}
