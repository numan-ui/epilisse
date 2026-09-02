/** A CSS value we are willing to inline: `#rgb`/`#rrggbb` or `rgb()/rgba()`. */
const SAFE_VALUE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$|^rgba?\([\d\s.,%]+\)$/;
/** A custom-property name: `--` then word chars / hyphens only. */
const SAFE_NAME = /^--[a-z0-9-]+$/i;

/**
 * Serialise a derived var map into a CSS rule. `html:root` (specificity
 * 0-0-1-1) is used so the injected override beats the `:root` block Tailwind
 * emits from globals.css `@theme` (0-0-1-0), regardless of stylesheet order,
 * while still losing to an inline `style` on the element (the admin live
 * preview).
 *
 * Values are whitelisted to colour tokens before they go into the string —
 * the map is trusted (PUT /api/theme validates every colour with isValidHex),
 * but this stays safe even if the DB row is edited directly, since the result
 * is inlined via dangerouslySetInnerHTML.
 */
export function themeVarsToCss(vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .filter(([k, v]) => SAFE_NAME.test(k) && SAFE_VALUE.test(v))
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `html:root{${body}}`;
}
