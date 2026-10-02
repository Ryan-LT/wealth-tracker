import { totalAssetValue, type AssetsState } from "@/entities/asset";
import { totalDebtBalance, type Debt } from "@/entities/debt";
import {
  monthlyIncomeByKind,
  totalMonthlyIncomeFromSources,
  type IncomeSource,
} from "@/entities/income";
import {
  estimatedMonthlyNetCashflow,
  projectNetWorthEndOfYear,
  resolveAverageMonthlySpending,
  type Preferences,
} from "@/entities/preferences";
import type { PersonalLoan } from "@/entities/personal-loan";
import { totalSettingsAssetsValue, type SettingsAsset } from "@/entities/settings-asset";

import { personalLoanBalances, totalCombinedAssetValue } from "./net-worth";

export type CashflowSummary = {
  totalIncome: number;
  activeIncome: number;
  passiveIncome: number;
  averageSpending: number;
  /** Household monthly net used by every projection. */
  monthlyNet: number;
};

export function summarizeCashflow(
  prefs: Preferences,
  sources: IncomeSource[],
): CashflowSummary {
  const totalIncome = totalMonthlyIncomeFromSources(sources);
  return {
    totalIncome,
    activeIncome: monthlyIncomeByKind(sources, "active"),
    passiveIncome: monthlyIncomeByKind(sources, "passive"),
    averageSpending: resolveAverageMonthlySpending(prefs),
    monthlyNet: estimatedMonthlyNetCashflow(prefs, totalIncome),
  };
}

export type DashboardSummary = CashflowSummary & {
  grossAssets: number;
  liabilities: number;
  netWorth: number;
  eoyProjection: number;
  /** Legacy portfolio detail (`assets` table). */
  portfolioDetailTotal: number;
  /** Asset catalog (`settingsAssets` table). */
  assetConfigurationTotal: number;
  /** Open personal loans counted in net worth (0 unless the preference is on). */
  loansLent: number;
  loansBorrowed: number;
};

export function computeDashboardSummary(t: {
  assets: AssetsState;
  debts: Debt[];
  settingsAssets: SettingsAsset[];
  incomeSources: IncomeSource[];
  prefs: Preferences;
  personalLoans?: PersonalLoan[];
}): DashboardSummary {
  const loans = t.prefs.includeLoansInNetWorth ? personalLoanBalances(t.personalLoans) : { lent: 0, borrowed: 0 };
  const grossAssets = totalCombinedAssetValue(t.assets, t.settingsAssets) + loans.lent;
  const liabilities = totalDebtBalance(t.debts) + loans.borrowed;
  const netWorth = grossAssets - liabilities;
  const cashflow = summarizeCashflow(t.prefs, t.incomeSources);
  return {
    ...cashflow,
    grossAssets,
    liabilities,
    netWorth,
    eoyProjection: projectNetWorthEndOfYear(netWorth, t.prefs, cashflow.totalIncome),
    portfolioDetailTotal: totalAssetValue(t.assets),
    assetConfigurationTotal: totalSettingsAssetsValue(t.settingsAssets),
    loansLent: loans.lent,
    loansBorrowed: loans.borrowed,
  };
}
