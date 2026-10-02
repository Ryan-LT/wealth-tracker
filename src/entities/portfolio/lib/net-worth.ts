import { totalAssetValue, type AssetsState } from "@/entities/asset";
import { totalDebtBalance, type Debt } from "@/entities/debt";
import { totalOpenAmount, type PersonalLoan } from "@/entities/personal-loan";
import { totalSettingsAssetsValue, type SettingsAsset } from "@/entities/settings-asset";

/** Gross assets for net worth: legacy portfolio detail + asset catalog. */
export function totalCombinedAssetValue(
  assets: AssetsState,
  settingsAssets: SettingsAsset[],
): number {
  return totalAssetValue(assets) + totalSettingsAssetsValue(settingsAssets);
}

/** Open personal loans as net-worth lines: lent out (asset) and borrowed (debt). */
export function personalLoanBalances(loans: PersonalLoan[] | undefined): { lent: number; borrowed: number } {
  return {
    lent: totalOpenAmount(loans ?? [], "lent_out"),
    borrowed: totalOpenAmount(loans ?? [], "borrowed"),
  };
}

/**
 * Net worth = gross assets − debts. Open personal loans count only when
 * `includeLoans` is on (lent out adds, borrowed subtracts).
 */
export function computeNetWorth(t: {
  assets: AssetsState;
  settingsAssets: SettingsAsset[];
  debts: Debt[];
  personalLoans?: PersonalLoan[];
  includeLoans?: boolean;
}): number {
  const loans = t.includeLoans ? personalLoanBalances(t.personalLoans) : { lent: 0, borrowed: 0 };
  return (
    totalCombinedAssetValue(t.assets, t.settingsAssets) + loans.lent - totalDebtBalance(t.debts) - loans.borrowed
  );
}
