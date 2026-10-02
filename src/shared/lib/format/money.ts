import { formatLocale } from "./locale";
import { formatNumber, MINUS, signPrefix, type SignDisplay } from "./number";

const SYMBOL = "₫";

export type MoneyFormatOptions = {
  signDisplay?: SignDisplay;
  /** Append " ₫" (default true). */
  symbol?: boolean;
};

/** Full VND amount: `1.245.670.000 ₫`, `−25.000 ₫`, `+1.000 ₫`. */
export function formatMoney(amount: number, opts: MoneyFormatOptions = {}): string {
  const { signDisplay = "auto", symbol = true } = opts;
  if (!Number.isFinite(amount)) return symbol ? `— ${SYMBOL}` : "—";
  const n = formatNumber(Math.round(amount), { signDisplay });
  return symbol ? `${n} ${SYMBOL}` : n;
}

const UNITS = [
  { value: 1e12, suffix: { en: "T", vi: " nghìn tỷ" } },
  { value: 1e9, suffix: { en: "B", vi: " tỷ" } },
  { value: 1e6, suffix: { en: "M", vi: " tr" } },
  { value: 1e3, suffix: { en: "K", vi: "K" } },
] as const;

/**
 * Compact VND for KPI tiles and chart axes, 3 significant digits:
 * `4,82B ₫`, `32,5M ₫`, `850K ₫` (Vietnamese: `4,82 tỷ ₫`, `32,5 tr ₫`, `850K ₫`).
 * Always pair with the full value (tooltip/label).
 */
export function formatMoneyCompact(amount: number, opts: MoneyFormatOptions = {}): string {
  const { signDisplay = "auto", symbol = true } = opts;
  if (!Number.isFinite(amount)) return symbol ? `— ${SYMBOL}` : "—";
  const abs = Math.abs(amount);
  const zero = Math.round(abs) === 0;
  const sign = signPrefix(amount < 0 && !zero, zero, signDisplay);

  let body: string;
  if (abs < 1000) {
    body = formatNumber(Math.round(abs));
  } else {
    let unitIndex = UNITS.findIndex((u) => abs >= u.value);
    let scaled = abs / UNITS[unitIndex].value;
    let rounded = roundSignificant(scaled, 3);
    // 999,95M rounds to 1000M → promote to 1B.
    if (rounded >= 1000 && unitIndex > 0) {
      unitIndex -= 1;
      scaled = abs / UNITS[unitIndex].value;
      rounded = roundSignificant(scaled, 3);
    }
    const intDigits = Math.floor(rounded).toString().length;
    body = `${formatNumber(rounded, { maximumFractionDigits: Math.max(0, 3 - intDigits) })}${UNITS[unitIndex].suffix[formatLocale()]}`;
  }
  return symbol ? `${sign}${body} ${SYMBOL}` : `${sign}${body}`;
}

function roundSignificant(value: number, digits: number): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(value)) + 1;
  const factor = 10 ** (digits - magnitude);
  return Math.round(value * factor) / factor;
}

/** USD for the milestone: `$1,000,000` (US convention). */
export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return "$—";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return amount < 0 ? `${MINUS}${formatted}` : formatted;
}

/** `$1M`, `$250K`. */
export function formatUsdCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}
