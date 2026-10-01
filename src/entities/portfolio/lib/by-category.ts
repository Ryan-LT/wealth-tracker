import type { AssetsState } from "@/entities/asset";
import type { SettingsAsset } from "@/entities/settings-asset";

export type CategoryTotal = { category: string; value: number; share: number; count: number };

/** Gross asset value per category (catalog + legacy portfolio), largest first. */
export function assetTotalsByCategory(catalog: SettingsAsset[], legacy: AssetsState): CategoryTotal[] {
  const totals = new Map<string, { value: number; count: number }>();
  const add = (category: string, value: number) => {
    const key = category.trim() || "Other";
    const prev = totals.get(key) ?? { value: 0, count: 0 };
    totals.set(key, { value: prev.value + Math.max(0, value), count: prev.count + 1 });
  };
  for (const a of catalog) add(a.category, a.currentValue);
  for (const p of legacy.realEstate) add("Real Estate", p.estValue);
  for (const c of legacy.cashAccounts) add("Cash", c.balance);
  for (const i of legacy.investments) add("Investments", i.value);

  const grand = [...totals.values()].reduce((s, t) => s + t.value, 0);
  return [...totals.entries()]
    .map(([category, t]) => ({ category, value: t.value, count: t.count, share: grand > 0 ? t.value / grand : 0 }))
    .filter((t) => t.value > 0)
    .sort((a, b) => b.value - a.value || a.category.localeCompare(b.category));
}
