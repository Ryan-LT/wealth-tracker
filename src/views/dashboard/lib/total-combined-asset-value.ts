import { totalAssetValue, type AssetsState } from "@/entities/asset";
import { totalSettingsAssetsValue, type SettingsAsset } from "@/entities/settings-asset";

/** Gross assets for net worth: detailed tracker sections + Settings asset catalog. */
export function totalCombinedAssetValue(
  assets: AssetsState,
  settingsAssets: SettingsAsset[],
): number {
  return totalAssetValue(assets) + totalSettingsAssetsValue(settingsAssets);
}
