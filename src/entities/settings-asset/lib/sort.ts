import {
  resolveSettingsAssetLiquidity,
  type SettingsAsset,
} from "@/entities/settings-asset/model";

export type AssetSortKey = "name" | "category" | "liquidity" | "value";
export type AssetSortDir = "asc" | "desc";
export type AssetSortState = { key: AssetSortKey; dir: AssetSortDir };

/** asc → desc → off. */
export function nextSortState(
  prev: AssetSortState | null,
  key: AssetSortKey,
): AssetSortState | null {
  if (!prev || prev.key !== key) return { key, dir: "asc" };
  if (prev.dir === "asc") return { key, dir: "desc" };
  return null;
}

function liquidityRank(v: SettingsAsset["liquidity"]): number {
  return resolveSettingsAssetLiquidity(v) === "instant" ? 0 : 1;
}

/** Sort a copy; ties break by id ascending regardless of direction. */
export function sortSettingsAssets(
  items: SettingsAsset[],
  key: AssetSortKey,
  dir: AssetSortDir,
): SettingsAsset[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "category":
        cmp = a.category.localeCompare(b.category, undefined, { sensitivity: "base" });
        break;
      case "liquidity":
        cmp = liquidityRank(a.liquidity) - liquidityRank(b.liquidity);
        break;
      case "value":
        cmp = a.currentValue - b.currentValue;
        break;
    }
    if (cmp !== 0) return mul * cmp;
    return a.id.localeCompare(b.id);
  });
}
