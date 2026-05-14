/** Compact USD formatter for milestone copy (goal amounts, FX context). */
export function formatUsd(amount: number, decimals: number = 0): string {
  if (!Number.isFinite(amount)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
