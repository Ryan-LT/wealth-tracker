/** Average calendar month length used by every linear projection in the app. */
export const AVG_MONTH_MS = (1000 * 60 * 60 * 24 * 365.25) / 12;

/**
 * Parse an ISO day (`yyyy-mm-dd`, optionally with a time part that is ignored)
 * at **local noon** so it never shifts a day across time zones.
 */
export function parseIsoDay(iso: string | null | undefined): Date | null {
  if (iso == null) return null;
  const day = String(iso).trim().split("T")[0];
  if (!day) return null;
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Local midnight of the given instant. */
export function localDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** `yyyy-mm-dd` in local time. */
export function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's local `yyyy-mm-dd`. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDay(now);
}

/** Non-negative average months between two instants. */
export function fractionalMonthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / AVG_MONTH_MS);
}
