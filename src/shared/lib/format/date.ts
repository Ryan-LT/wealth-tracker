import { format, formatDistanceToNowStrict } from "date-fns";

import { parseIsoDay } from "@/shared/lib/date";

import { formatNumber } from "./number";

export type DateStyle = "medium" | "monthYear" | "dayMonth";

const PATTERNS: Record<DateStyle, string> = {
  medium: "d MMM yyyy",
  monthYear: "MMM yyyy",
  dayMonth: "d MMM",
};

function toDate(input: string | Date | number): Date | null {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") return new Date(input);
  return parseIsoDay(input);
}

/** `12 Mar 2026` (medium), `Mar 2026` (monthYear), `12 Mar` (dayMonth). */
export function formatDate(input: string | Date | number | null | undefined, style: DateStyle = "medium"): string {
  if (input == null || input === "") return "—";
  const d = toDate(input);
  return d ? format(d, PATTERNS[style]) : String(input);
}

/** `14:05`. */
export function formatTime(input: Date | number): string {
  return format(input, "HH:mm");
}

/** `3 min ago`. */
export function formatRelative(input: Date | number): string {
  return `${formatDistanceToNowStrict(input)} ago`;
}

/** `4,2 mo`. */
export function formatMonths(months: number): string {
  return `${formatNumber(months, { maximumFractionDigits: 1 })} mo`;
}
