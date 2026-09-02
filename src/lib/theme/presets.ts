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
};

export const PRESETS = {
  goldLux: GOLD_LUX,
  antiqueRose: ANTIQUE_ROSE,
} as const;

export type PresetName = keyof typeof PRESETS;

export const PRESET_LABEL: Record<PresetName, string> = {
  goldLux: 'Gold Lux',
  antiqueRose: 'Antique Rose',
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
