import type { AssetsState } from "@/shared/storage/assets";
import type { Debt } from "@/shared/storage/debts";
import type { IncomeSource, SettingsAsset } from "@/shared/storage/incomeSources";

export function totalAssetValue(assets: AssetsState): number {
  const realEstate = assets.realEstate.reduce((s, p) => s + p.estValue, 0);
  const cash = assets.cashAccounts.reduce((s, a) => s + a.balance, 0);
  const investments = assets.investments.reduce((s, i) => s + i.value, 0);
  return realEstate + cash + investments;
}

/** Sum of line items from Settings → Asset Management (flat catalog). */
export function totalSettingsAssetsValue(items: SettingsAsset[]): number {
  return items.reduce((s, a) => s + Math.max(0, a.currentValue), 0);
}

/** Gross assets for net worth: detailed tracker sections + Settings asset catalog. */
export function totalCombinedAssetValue(
  assets: AssetsState,
  settingsAssets: SettingsAsset[],
): number {
  return totalAssetValue(assets) + totalSettingsAssetsValue(settingsAssets);
}

export function totalDebtBalance(debts: Debt[]): number {
  return debts.reduce((s, d) => s + d.balance, 0);
}

export function monthlyIncomeByKind(
  sources: IncomeSource[],
  kind: IncomeSource["kind"],
): number {
  return sources.filter((s) => s.kind === kind).reduce((s, x) => s + x.monthly, 0);
}

/** Sum of all income source monthly amounts (active + passive). */
export function totalMonthlyIncomeFromSources(sources: IncomeSource[]): number {
  return sources.reduce((sum, s) => sum + (s.monthly || 0), 0);
}
