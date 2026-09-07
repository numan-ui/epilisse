/** Parse a formatted price like "€ 149,00" / "ab € 15,00" into a number, or null. */
export function priceToNumber(s: string): number | null {
  const cleaned = s
    .replace(/[^\d.,]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '') // thousands dot
    .replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

/** Whole-percent discount from old→new price, or null when it can't be computed / isn't a real reduction. */
export function discountPct(oldPrice?: string, newPrice?: string): number | null {
  if (!oldPrice || !newPrice) return null;
  const a = priceToNumber(oldPrice);
  const b = priceToNumber(newPrice);
  if (a == null || b == null || a <= 0 || b >= a) return null;
  return Math.round((1 - b / a) * 100);
}
