/**
 * Format a numeric VND amount the way the Stitch designs render it:
 * "₫1.245.670.000" — period as thousands separator, leading currency glyph.
 */
export function formatVnd(
  amount: number,
  options: {
    /** Show explicit "+" prefix for positive numbers (used in transaction tables). */
    showSign?: boolean;
    /** Skip the "₫" glyph (e.g. when rendered in a column already labelled VND). */
    omitSymbol?: boolean;
    /** Number of decimal digits. Defaults to 0 for whole VND. */
    decimals?: number;
  } = {},
): string {
  const { showSign = false, omitSymbol = false, decimals = 0 } = options;
  if (!Number.isFinite(amount)) return omitSymbol ? "—" : "₫—";
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const intGrouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const numeric =
    fracPart && Number(fracPart) !== 0 ? `${intGrouped},${fracPart}` : intGrouped;

  const symbol = omitSymbol ? "" : "₫";
  const sign = isNegative ? "-" : showSign ? "+" : "";

  return `${sign}${symbol}${numeric}`;
}

/**
 * Lighter formatter for a unit-less integer with thousands separators
 * (used in the Settings asset management table and similar.)
 */
export function formatThousands(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  const abs = Math.abs(amount);
  const grouped = abs
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return amount < 0 ? `-${grouped}` : grouped;
}
