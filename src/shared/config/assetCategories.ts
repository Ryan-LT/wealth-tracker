import type { Preferences } from "@/shared/storage/preferences";
import type { SettingsAsset } from "@/shared/storage/incomeSources";

/**
 * Built-in asset categories for Settings → Asset Management combobox.
 * Users can add more; those are stored in {@link Preferences.extraAssetCategories}.
 */
export const DEFAULT_ASSET_CATEGORIES = [
  "Cash",
  "Real Estate",
  "Open-Ended Funds",
  "Car",
  "Other",
  "Loan",
  "Stocks & ETFs",
  "Bonds",
  "Crypto",
  "Precious Metals",
  "Business",
] as const;

export type DefaultAssetCategory = (typeof DEFAULT_ASSET_CATEGORIES)[number];

const defaultSet = new Set<string>(DEFAULT_ASSET_CATEGORIES);

export function isDefaultAssetCategory(label: string): boolean {
  return defaultSet.has(label.trim());
}

/** Options shown in the category combobox: defaults + saved customs + any label already used on an asset. */
export function mergeAssetCategoryOptions(
  prefs: Pick<Preferences, "extraAssetCategories">,
  assets: Pick<SettingsAsset, "category">[],
): string[] {
  const set = new Set<string>();
  for (const c of DEFAULT_ASSET_CATEGORIES) set.add(c);
  for (const c of prefs.extraAssetCategories ?? []) {
    const t = c.trim();
    if (t) set.add(t);
  }
  for (const a of assets) {
    const t = a.category?.trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}
