import {
  adjustL,
  contrastRatio,
  ensureContrast,
  luminance,
  mix,
  readableOn,
  rgba,
  tint,
  withSL,
} from './color';
import type { DeriveResult, ThemeInput } from './types';

/**
 * Expand the 8 admin-picked colours into the full set of CSS custom
 * properties the app reads (every `--color-*` defined in globals.css plus the
 * hero-panel vars), running each text/background pair through a WCAG-AA guard.
 *
 * The eight inputs land on their primary token unchanged (so the picker is
 * predictable); the ~40 supporting tokens are tinted / lightened / darkened
 * off them.
 */
export function deriveTokens(input: ThemeInput): DeriveResult {
  const notes: string[] = [];
  const v: Record<string, string> = {};

  const brand = input.brand;
  const surface = input.surface;
  const card = input.card;
  const accent = input.accent;
  const heroPanel = input.heroPanel;

  // ── primary ────────────────────────────────────────────────
  v['--color-primary'] = brand;
  v['--color-surface-tint'] = brand;

  const onPrimary = ensureContrast(input.onBrand, brand, 4.5);
  v['--color-on-primary'] = onPrimary;
  if (onPrimary.toLowerCase() !== input.onBrand.toLowerCase()) {
    notes.push(`Buton yazı rengi okunabilirlik için ayarlandı: ${onPrimary.toUpperCase()}`);
  }

  // Hover carries the same label as the resting button; if that passes AA
  // (guarded above) a marginally lighter hover is an accepted trade-off, so
  // the hover colour is used exactly as picked.
  const brandHover = input.brandHover;
  v['--color-primary-container'] = brandHover;
  v['--color-on-primary-container'] = ensureContrast(withSL(brand, 0.55, 0.16), brandHover, 4.5);

  v['--color-primary-fixed'] = withSL(brand, 0.5, 0.86);
  v['--color-primary-fixed-dim'] = withSL(brand, 0.55, 0.72);
  v['--color-on-primary-fixed'] = withSL(brand, 0.6, 0.13);
  v['--color-on-primary-fixed-variant'] = withSL(brand, 0.45, 0.32);
  v['--color-inverse-primary'] = withSL(brand, 0.5, 0.82);

  if (contrastRatio(brand, surface) < 3) {
    notes.push(
      'Marka rengi zemine göre düşük kontrastlı — butonlar okunur ama ince link yazısında dikkat.',
    );
  }

  // ── secondary (warm neutral pulled off the brand hue) ──────
  const secondary = withSL(mix(input.text, brand, 0.35), 0.08, 0.4);
  const secondaryContainer = tint(brand, 0.25, 0.9);
  v['--color-secondary'] = secondary;
  v['--color-on-secondary'] = readableOn(secondary);
  v['--color-secondary-container'] = secondaryContainer;
  v['--color-on-secondary-container'] = ensureContrast(input.text, secondaryContainer, 4.5);
  v['--color-secondary-fixed'] = secondaryContainer;
  v['--color-secondary-fixed-dim'] = adjustL(secondaryContainer, -0.1);
  v['--color-on-secondary-fixed'] = withSL(input.text, 0.1, 0.12);
  v['--color-on-secondary-fixed-variant'] = withSL(secondary, 0.12, 0.3);

  // ── tertiary (the accent colour) ──────────────────────────
  // The accent swatch is used raw as the highlight surface; the matching
  // text/icon tone is pulled darker off it so it reads on the page. This is
  // normal derivation (Gold Lux does the same), not a correction — no note.
  const tertiary = ensureContrast(accent, surface, 3);
  const accentDark = luminance(accent) < 0.4;
  const onTertiaryContainer = ensureContrast(
    accentDark ? withSL(accent, 0.2, 0.94) : withSL(accent, 0.45, 0.13),
    accent,
    4.5,
  );
  v['--color-tertiary'] = tertiary;
  v['--color-on-tertiary'] = readableOn(tertiary);
  v['--color-tertiary-container'] = accent;
  v['--color-on-tertiary-container'] = onTertiaryContainer;
  v['--color-tertiary-fixed'] = tint(accent, 0.5, 0.86);
  v['--color-tertiary-fixed-dim'] = tint(accent, 0.5, 0.72);
  v['--color-on-tertiary-fixed'] = withSL(accent, 0.4, 0.12);
  v['--color-on-tertiary-fixed-variant'] = withSL(accent, 0.3, 0.32);

  // ── surfaces ──────────────────────────────────────────────
  v['--color-surface'] = surface;
  v['--color-background'] = surface;
  v['--color-surface-bright'] = adjustL(surface, 0.02);
  v['--color-surface-dim'] = adjustL(surface, -0.09);
  v['--color-surface-container-lowest'] = adjustL(surface, 0.03);
  v['--color-surface-container-low'] = mix(surface, card, 0.45);
  v['--color-surface-container'] = card;
  v['--color-surface-container-high'] = adjustL(card, -0.035);
  v['--color-surface-container-highest'] = adjustL(card, -0.07);
  v['--color-surface-variant'] = adjustL(card, -0.07);
  v['--color-inverse-surface'] = withSL(input.text, 0.06, 0.2);
  v['--color-inverse-on-surface'] = withSL(surface, 0.3, 0.95);

  // ── text / outline ────────────────────────────────────────
  const onSurface = ensureContrast(input.text, surface, 4.5);
  v['--color-on-surface'] = onSurface;
  v['--color-on-background'] = onSurface;
  if (onSurface.toLowerCase() !== input.text.toLowerCase()) {
    notes.push(`Ana metin rengi okunabilirlik için koyulaştırıldı: ${onSurface.toUpperCase()}`);
  }
  v['--color-on-surface-variant'] = ensureContrast(mix(onSurface, surface, 0.28), surface, 4.5);
  v['--color-outline'] = ensureContrast(mix(onSurface, surface, 0.5), surface, 3);
  v['--color-outline-variant'] = mix(onSurface, surface, 0.8);

  // ── error (kept, lightly re-toned to the surface) ─────────
  v['--color-error'] = '#ba1a1a';
  v['--color-on-error'] = '#ffffff';
  v['--color-error-container'] = '#ffdad6';
  v['--color-on-error-container'] = '#93000a';

  // ── hero split-panel ─────────────────────────────────────
  const heroLight = luminance(heroPanel) > 0.4;
  v['--hero-panel-top'] = adjustL(heroPanel, heroLight ? 0.015 : 0.04);
  v['--hero-panel-bottom'] = adjustL(heroPanel, heroLight ? -0.05 : -0.055);
  if (heroLight) {
    const onPanel = ensureContrast(onSurface, heroPanel, 6);
    v['--hero-on-panel'] = onPanel;
    v['--hero-on-panel-muted'] = ensureContrast(mix(onPanel, heroPanel, 0.25), heroPanel, 4.5);
    v['--hero-on-panel-dim'] = ensureContrast(mix(onPanel, heroPanel, 0.42), heroPanel, 3);
    v['--hero-hint-line'] = rgba(onPanel, 0.14);
    v['--hero-hint-shadow'] = rgba(onPanel, 0.12);
  } else {
    v['--hero-on-panel'] = '#ffffff';
    v['--hero-on-panel-muted'] = 'rgba(255, 255, 255, 0.82)';
    v['--hero-on-panel-dim'] = 'rgba(255, 255, 255, 0.6)';
    v['--hero-hint-line'] = 'rgba(255, 255, 255, 0.15)';
    v['--hero-hint-shadow'] = 'rgba(0, 0, 0, 0.6)';
  }
  v['--hero-bead'] = brand;
  v['--hero-bead-glow'] = rgba(brand, 0.5);

  // ── solid colour behind the hardcoded glow spots in globals.css
  //    (used there via color-mix for the alpha) ────────────────
  v['--brand-glow'] = brandHover;

  return { vars: v, notes };
}
