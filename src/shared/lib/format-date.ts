/**
 * Format an ISO calendar date for on-screen display as **DD/MM/YYYY**
 * (fixed for this app; values are stored as ISO strings elsewhere).
 */
export function formatDisplayDate(iso: string): string {
  const raw = iso.trim();
  if (!raw) return iso;
  const d = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
