/** Unicode minus — typographically correct and the same width as "+". */
export const MINUS = "−";

export type SignDisplay = "auto" | "always" | "exceptZero" | "never";

function groupThousands(intDigits: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Vietnamese-style number: dot thousands separator, comma decimal mark.
 * `1245670.5` → "1.245.670,5". Trailing fractional zeros are trimmed.
 */
export function formatNumber(
  value: number,
  opts: { maximumFractionDigits?: number; minimumFractionDigits?: number; signDisplay?: SignDisplay } = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const { maximumFractionDigits = 0, minimumFractionDigits = 0, signDisplay = "auto" } = opts;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(maximumFractionDigits);
  let [intPart, frac = ""] = fixed.split(".");
  frac = frac.replace(/0+$/, "");
  if (frac.length < minimumFractionDigits) frac = frac.padEnd(minimumFractionDigits, "0");
  const isZero = Number(fixed) === 0;
  const body = frac ? `${groupThousands(intPart)},${frac}` : groupThousands(intPart);
  return `${signPrefix(value < 0 && !isZero, isZero, signDisplay)}${body}`;
}

export function signPrefix(negative: boolean, zero: boolean, signDisplay: SignDisplay): string {
  if (signDisplay === "never") return "";
  if (negative) return MINUS;
  if (signDisplay === "always") return "+";
  if (signDisplay === "exceptZero" && !zero) return "+";
  return "";
}

/** "12,5%" — value is already in percent units. */
export function formatPercent(
  valueInPercent: number,
  opts: { maximumFractionDigits?: number; signDisplay?: SignDisplay } = {},
): string {
  if (!Number.isFinite(valueInPercent)) return "—";
  return `${formatNumber(valueInPercent, { maximumFractionDigits: opts.maximumFractionDigits ?? 1, signDisplay: opts.signDisplay })}%`;
}

/** "15th", "1st", "22nd". */
export function formatOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
