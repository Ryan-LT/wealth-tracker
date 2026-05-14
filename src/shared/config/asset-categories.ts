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

/** Tailwind class sets for category pills (defaults + stable hash for customs).
 *  Light surfaces + `text-on-background` or strong `on-*` pairs for contrast;
 *  each built-in category uses a different hue family so rows are easy to scan. */
const DEFAULT_CATEGORY_BADGES: Record<DefaultAssetCategory, string> = {
  Cash:
    "font-medium bg-secondary-container text-on-background ring-1 ring-inset ring-secondary/50",
  "Real Estate":
    "font-medium bg-tertiary-fixed text-on-background ring-1 ring-inset ring-on-tertiary-fixed/40",
  "Open-Ended Funds":
    "font-medium bg-primary-fixed text-on-background ring-1 ring-inset ring-primary/30",
  Car:
    "font-medium bg-surface-container-high text-on-surface ring-1 ring-inset ring-outline-variant",
  Other:
    "font-medium bg-outline-variant text-on-background ring-1 ring-inset ring-outline",
  Loan:
    "font-medium bg-surface-container-highest text-on-background ring-1 ring-inset ring-primary/40",
  "Stocks & ETFs":
    "font-medium bg-primary-fixed-dim text-on-background ring-1 ring-inset ring-on-primary-fixed-variant/45",
  Bonds:
    "font-medium bg-tertiary-fixed-dim text-on-background ring-1 ring-inset ring-on-tertiary-fixed-variant/40",
  Crypto:
    "font-medium bg-inverse-primary/35 text-on-background ring-1 ring-inset ring-on-primary-fixed-variant/45",
  "Precious Metals":
    "font-medium bg-secondary-fixed-dim text-on-secondary-fixed ring-1 ring-inset ring-secondary/55",
  Business:
    "font-medium bg-surface-container text-on-surface ring-1 ring-inset ring-outline-variant",
};

const CUSTOM_CATEGORY_BADGE_ROTATION = [
  "font-medium bg-secondary-container/90 text-on-background ring-1 ring-inset ring-secondary/50",
  "font-medium bg-tertiary-fixed/90 text-on-background ring-1 ring-inset ring-on-tertiary-fixed/40",
  "font-medium bg-primary-fixed/90 text-on-background ring-1 ring-inset ring-primary/30",
  "font-medium bg-secondary-fixed/90 text-on-secondary-fixed ring-1 ring-inset ring-secondary/50",
  "font-medium bg-tertiary-fixed-dim/90 text-on-background ring-1 ring-inset ring-on-tertiary-fixed-variant/40",
  "font-medium bg-primary-fixed-dim/90 text-on-background ring-1 ring-inset ring-on-primary-fixed-variant/45",
  "font-medium bg-error-container/80 text-on-error-container ring-1 ring-inset ring-error/35",
  "font-medium bg-surface-container-highest text-on-background ring-1 ring-inset ring-outline",
] as const;

export function isDefaultAssetCategory(label: string): boolean {
  return defaultSet.has(label.trim());
}

function hashCategoryLabel(label: string): number {
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Badge surface + text classes for an asset category label. Built-in categories
 * get fixed colors; unknown labels rotate a stable palette from the label hash.
 */
export function assetCategoryBadgeClassNames(category: string): string {
  const raw = category.trim();
  if (!raw) {
    return "font-medium bg-surface-container-high text-on-surface ring-1 ring-inset ring-outline-variant";
  }
  const lower = raw.toLowerCase();
  for (const def of DEFAULT_ASSET_CATEGORIES) {
    if (def.toLowerCase() === lower) {
      return DEFAULT_CATEGORY_BADGES[def];
    }
  }
  const idx = hashCategoryLabel(lower) % CUSTOM_CATEGORY_BADGE_ROTATION.length;
  return CUSTOM_CATEGORY_BADGE_ROTATION[idx]!;
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
