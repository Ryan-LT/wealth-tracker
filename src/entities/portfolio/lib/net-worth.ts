import { totalAssetValue, type AssetsState } from "@/entities/asset";
import { totalDebtBalance, type Debt } from "@/entities/debt";
import { totalSettingsAssetsValue, type SettingsAsset } from "@/entities/settings-asset";

/** Gross assets for net worth: legacy portfolio detail + asset catalog. */
export function totalCombinedAssetValue(
  assets: AssetsState,
  settingsAssets: SettingsAsset[],
): number {
  return totalAssetValue(assets) + totalSettingsAssetsValue(settingsAssets);
}

/** Net worth = gross assets − debts. Personal loans are intentionally excluded. */
export function computeNetWorth(t: {
  assets: AssetsState;
  settingsAssets: SettingsAsset[];
  debts: Debt[];
}): number {
  return totalCombinedAssetValue(t.assets, t.settingsAssets) - totalDebtBalance(t.debts);
}
