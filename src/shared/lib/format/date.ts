import { format, formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";

import { parseIsoDay } from "@/shared/lib/date";

import { formatLocale } from "./locale";
import { formatNumber } from "./number";

export type DateStyle = "medium" | "monthYear" | "dayMonth";

const PATTERNS: Record<"en" | "vi", Record<DateStyle, string>> = {
  en: { medium: "d MMM yyyy", monthYear: "MMM yyyy", dayMonth: "d MMM" },
  // `2 thg 10, 2026`, `thg 10, 2026`, `2 thg 10`.
  vi: { medium: "d 'thg' M, yyyy", monthYear: "'thg' M, yyyy", dayMonth: "d 'thg' M" },
};

function toDate(input: string | Date | number): Date | null {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") return new Date(input);
  return parseIsoDay(input);
}

/** `12 Mar 2026` (medium), `Mar 2026` (monthYear), `12 Mar` (dayMonth); Vietnamese `12 thg 3, 2026`. */
export function formatDate(input: string | Date | number | null | undefined, style: DateStyle = "medium"): string {
  if (input == null || input === "") return "—";
  const d = toDate(input);
  return d ? format(d, PATTERNS[formatLocale()][style]) : String(input);
}

/** `14:05`. */
export function formatTime(input: Date | number): string {
  return format(input, "HH:mm");
}

/** `3 min ago` / `3 phút trước`. */
export function formatRelative(input: Date | number): string {
  if (formatLocale() === "vi") return `${formatDistanceToNowStrict(input, { locale: vi })} trước`;
  return `${formatDistanceToNowStrict(input)} ago`;
}

/** `4,2 mo` / `4,2 tháng`. */
export function formatMonths(months: number): string {
  return `${formatNumber(months, { maximumFractionDigits: 1 })} ${formatLocale() === "vi" ? "tháng" : "mo"}`;
}
