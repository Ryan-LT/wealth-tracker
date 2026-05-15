import type { Preferences } from "@/shared/storage/preferences";
import type { SettingsAsset } from "@/shared/storage/income-sources";

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

/** One neutral chip for every category; distinguish defaults via {@link resolveAssetCategoryEmoji}. */
const CATEGORY_BADGE_CHIP =
  "inline-flex max-w-full items-center gap-1 truncate rounded-full border border-border bg-muted/45 px-2 py-0.5 font-semibold text-foreground";

const CATEGORY_BADGE_CHIP_EMPTY =
  "inline-flex max-w-full items-center gap-1 truncate rounded-full border border-dashed border-border bg-muted/25 px-2 py-0.5 font-semibold text-muted-foreground";

/** Colored emoji prefix per built-in category (native full-color glyphs). */
const DEFAULT_CATEGORY_EMOJI: Record<DefaultAssetCategory, string> = {
  Cash: "💵",
  "Real Estate": "🏠",
  "Open-Ended Funds": "📊",
  Car: "🚗",
  Other: "📦",
  Loan: "🏦",
  "Stocks & ETFs": "📈",
  Bonds: "📜",
  Crypto: "🪙",
  "Precious Metals": "💎",
  Business: "💼",
};

export function isDefaultAssetCategory(label: string): boolean {
  return defaultSet.has(label.trim());
}

/**
 * Badge layout + surface classes for an asset category chip (bordered pill).
 * Built-in and custom categories share the same shell; use prefix emoji to differentiate defaults.
 */
export function assetCategoryBadgeClassNames(category: string): string {
  const raw = category.trim();
  return raw ? CATEGORY_BADGE_CHIP : CATEGORY_BADGE_CHIP_EMPTY;
}

/** Emoji shown before the category label; defaults are mapped, customs use 🏷️. */
export function resolveAssetCategoryEmoji(category: string): string {
  const raw = category.trim();
  if (!raw) return "🏷️";
  const lower = raw.toLowerCase();
  for (const def of DEFAULT_ASSET_CATEGORIES) {
    if (def.toLowerCase() === lower) {
      return DEFAULT_CATEGORY_EMOJI[def];
    }
  }
  return "🏷️";
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
