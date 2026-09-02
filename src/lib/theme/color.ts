/**
 * Small dependency-free colour toolkit for the theme editor.
 * Everything works on `#rrggbb` / `#rgb` strings and returns `#rrggbb`.
 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex colour: ${hex}`);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function isValidHex(hex: unknown): hex is string {
  if (typeof hex !== 'string') return false;
  try {
    parseHex(hex);
    return true;
  } catch {
    return false;
  }
}

export function toHex({ r, g, b }: RGB): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** sRGB relative luminance (WCAG 2.1). */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, 1 (identical) … 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Shift lightness by an absolute amount in the 0–1 HSL scale. */
export function adjustL(hex: string, delta: number): string {
  const hsl = rgbToHsl(parseHex(hex));
  return toHex(hslToRgb({ ...hsl, l: clamp01(hsl.l + delta) }));
}

/** Keep the hue of `hex`, force saturation and lightness. */
export function withSL(hex: string, s: number, l: number): string {
  const hsl = rgbToHsl(parseHex(hex));
  return toHex(hslToRgb({ h: hsl.h, s: clamp01(s), l: clamp01(l) }));
}

/** Scale saturation, set lightness — useful for tinted neutrals. */
export function tint(hex: string, satFactor: number, l: number): string {
  const hsl = rgbToHsl(parseHex(hex));
  return toHex(hslToRgb({ h: hsl.h, s: clamp01(hsl.s * satFactor), l: clamp01(l) }));
}

/** Linear RGB blend; t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const k = clamp01(t);
  return toHex({
    r: ca.r + (cb.r - ca.r) * k,
    g: ca.g + (cb.g - ca.g) * k,
    b: ca.b + (cb.b - ca.b) * k,
  });
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp01(alpha)})`;
}

/**
 * Nudge `fg` lighter or darker (away from `bg`) until it clears `ratio`
 * against `bg`. Returns `fg` untouched if it already passes; returns the
 * best effort if even pure black/white can't reach the target.
 */
export function ensureContrast(fg: string, bg: string, ratio = 4.5): string {
  if (contrastRatio(fg, bg) >= ratio) return fg;
  const bgIsLight = luminance(bg) > 0.4;
  const step = bgIsLight ? -0.02 : 0.02;
  let out = fg;
  for (let i = 0; i < 60; i += 1) {
    out = adjustL(out, step);
    if (contrastRatio(out, bg) >= ratio) return out;
    const lum = luminance(out);
    if ((bgIsLight && lum <= 0) || (!bgIsLight && lum >= 1)) break;
  }
  return out;
}

/** Pick whichever of white / near-black reads best on `bg`. */
export function readableOn(bg: string, light = '#ffffff', dark = '#1b1b1b'): string {
  return contrastRatio(light, bg) >= contrastRatio(dark, bg) ? light : dark;
}
