"use client";

import { useEffect, useMemo } from "react";

import {
  buildGoalStartingOptions,
  estimatedMonthlyNetCashflow,
  monthlyIncomeByKind,
  projectNetWorthEndOfYear,
  syncNetWorthTracking,
  totalAssetValue,
  totalCombinedAssetValue,
  totalDebtBalance,
  totalGoalStartingBalance,
  totalMonthlyIncomeFromSources,
  totalSettingsAssetsValue,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  DEBTS_SEED,
  GOALS_SEED,
  goalProfileForDashboard,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  type AssetsState,
  useTable,
} from "@/shared/storage";
import { FinancialSummaryWidget } from "./FinancialSummaryWidget";
import { MetricGrid } from "./MetricGrid";
import { MillionBy35Card } from "./MillionBy35Card";
import { PrimaryGoalCard } from "./PrimaryGoalCard";

export function DashboardPage() {
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [debts] = useTable("debts", DEBTS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [goals] = useTable("goals", GOALS_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const netWorth = useMemo(() => {
    const gross = totalCombinedAssetValue(assets, settingsAssets);
    const liabilities = totalDebtBalance(debts);
    return gross - liabilities;
  }, [assets, debts, settingsAssets]);

  useEffect(() => {
    setPrefs((p) => syncNetWorthTracking(p, netWorth));
  }, [netWorth, setPrefs]);

  const summary = useMemo(() => {
    const grossAssets = totalCombinedAssetValue(assets, settingsAssets);
    const liabilities = totalDebtBalance(debts);
    const nw = grossAssets - liabilities;
    const incomeTotal = totalMonthlyIncomeFromSources(sources);
    return {
      totalAssets: grossAssets,
      totalNetWorth: nw,
      activeIncome: monthlyIncomeByKind(sources, "active"),
      passiveIncome: monthlyIncomeByKind(sources, "passive"),
      monthlyIncomeTotal: incomeTotal,
      totalDebt: -liabilities,
      eoyProjection: projectNetWorthEndOfYear(nw, prefs, incomeTotal),
      monthlyNet: estimatedMonthlyNetCashflow(prefs, incomeTotal),
    };
  }, [assets, debts, sources, prefs, settingsAssets]);

  const financialBreakdown = useMemo(() => {
    const portfolioDetailTotal = totalAssetValue(assets);
    const assetConfigurationTotal = totalSettingsAssetsValue(settingsAssets);
    const gross = totalCombinedAssetValue(assets, settingsAssets);
    const liabilities = totalDebtBalance(debts);
    return {
      portfolioDetailTotal,
      assetConfigurationTotal,
      totalAssets: gross,
      totalLiabilities: liabilities,
    };
  }, [assets, settingsAssets, debts]);

  const seedOptions = useMemo(
    () => buildGoalStartingOptions(assets, settingsAssets),
    [assets, settingsAssets],
  );

  const primaryProfile = goalProfileForDashboard(goals);

  const legacyPrimaryTarget =
    primaryProfile?.targetAmount ?? goals.primary.targetAmount;
  const legacyPrimaryName =
    (primaryProfile?.name?.trim() || goals.primary.name?.trim()) ??
    "Primary Goal";
  const legacySavedTowardPrimary =
    goals.primary.saved > 0
      ? Math.min(goals.primary.saved, legacyPrimaryTarget)
      : Math.min(Math.max(0, netWorth), legacyPrimaryTarget);

  const goalPlanCards = useMemo(() => {
    if (goals.profiles.length > 0) {
      return goals.profiles.map((plan) => ({
        key: plan.id,
        name: plan.name.trim() || "Untitled plan",
        targetAmount: plan.targetAmount,
        saved: totalGoalStartingBalance(
          plan.seedLines,
          seedOptions,
          goals.profiles,
          plan,
        ),
        savedCaption: "Allocated starting" as const,
        targetDate: plan.targetDate,
        includeMonthlyIncome: plan.includeMonthlyIncome !== false,
      }));
    }
    return [
      {
        key: "legacy-primary",
        name: legacyPrimaryName,
        targetAmount: legacyPrimaryTarget,
        saved: legacySavedTowardPrimary,
        savedCaption: "Saved" as const,
        targetDate: primaryProfile?.targetDate ?? "",
        includeMonthlyIncome: primaryProfile?.includeMonthlyIncome !== false,
      },
    ];
  }, [
    goals.profiles,
    legacyPrimaryName,
    legacyPrimaryTarget,
    legacySavedTowardPrimary,
    primaryProfile?.targetDate,
    primaryProfile?.includeMonthlyIncome,
    seedOptions,
  ]);

  return (
    <>
      <main className="flex w-full min-w-0 flex-1 flex-col py-10 max-md:px-margin-mobile md:min-h-screen md:px-stack-lg md:pb-8">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2 lg:items-stretch lg:gap-4">
          <div className="min-h-0 h-full">
            <FinancialSummaryWidget
              totalAssets={financialBreakdown.totalAssets}
              totalLiabilities={financialBreakdown.totalLiabilities}
              portfolioDetailTotal={financialBreakdown.portfolioDetailTotal}
              assetConfigurationTotal={
                financialBreakdown.assetConfigurationTotal
              }
            />
          </div>
          <div className="min-h-0 h-full">
            <MillionBy35Card
              currentNetWorth={summary.totalNetWorth}
              monthlyNetContribution={summary.monthlyNet}
              totalMonthlyIncome={summary.monthlyIncomeTotal}
            />
          </div>
        </div>

        <section className="mb-6 lg:mb-8">
          <h2 className="mb-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Goal plans
          </h2>
          <div className="grid grid-cols-1 gap-3 items-stretch sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {goalPlanCards.map((g) => (
              <PrimaryGoalCard
                key={g.key}
                name={g.name}
                targetAmount={g.targetAmount}
                saved={g.saved}
                savedCaption={g.savedCaption}
                targetDate={g.targetDate}
                includeMonthlyIncome={g.includeMonthlyIncome}
                estimatedMonthlyNet={summary.monthlyNet}
              />
            ))}
          </div>
        </section>

        <MetricGrid
          totalAssets={summary.totalAssets}
          activeIncome={summary.activeIncome}
          passiveIncome={summary.passiveIncome}
          totalDebt={summary.totalDebt}
          eoyProjection={summary.eoyProjection}
        />
      </main>
    </>
  );
}
