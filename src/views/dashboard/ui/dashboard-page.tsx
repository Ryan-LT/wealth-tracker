"use client";

import { useEffect, useMemo } from "react";

import { Header } from "@/widgets/page-header";
import { Main } from "@/widgets/page-shell";
import { ProfileDropdown } from "@/widgets/profile-menu";
import { ThemeSwitch } from "@/widgets/theme-switch";
import {
  buildGoalStartingOptions,
  estimatedMonthlyNetCashflow,
  monthlyIncomeByKind,
  projectNetWorthEndOfYear,
  resolveAverageMonthlySpending,
  syncNetWorthTracking,
  totalAssetValue,
  totalDebtBalance,
  totalGoalStartingBalance,
  totalMonthlyIncomeFromSources,
  totalSettingsAssetsValue,
} from "@/shared/lib";

import { totalCombinedAssetValue } from "@/views/dashboard/lib/total-combined-asset-value";
import {
  ASSETS_SEED,
  DEBTS_SEED,
  GOALS_SEED,
  goalProfileForDashboard,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  type AssetsState,
  useHydrated,
  useTable,
} from "@/shared/storage";

import { FinancialSummaryWidget } from "./financial-summary-widget";
import { MetricGrid } from "./metric-grid";
import { MillionBy35Card } from "./million-by-35-card";
import { PrimaryGoalCard } from "./primary-goal-card";

export function DashboardPage() {
  const hydrated = useHydrated();
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
    if (!hydrated) return;
    setPrefs((p) => syncNetWorthTracking(p, netWorth));
  }, [hydrated, netWorth, setPrefs]);

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
      totalDebt: -liabilities,
      eoyProjection: projectNetWorthEndOfYear(nw, prefs, incomeTotal),
      monthlyNet: estimatedMonthlyNetCashflow(prefs, incomeTotal),
      averageSpending: resolveAverageMonthlySpending(prefs),
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
      <Header fixed>
        <h1 className="text-lg font-semibold md:text-xl md:font-medium">
          Dashboard
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FinancialSummaryWidget
            totalAssets={financialBreakdown.totalAssets}
            totalLiabilities={financialBreakdown.totalLiabilities}
            portfolioDetailTotal={financialBreakdown.portfolioDetailTotal}
            assetConfigurationTotal={financialBreakdown.assetConfigurationTotal}
            loading={!hydrated}
          />
          <MillionBy35Card
            currentNetWorth={summary.totalNetWorth}
            monthlyNetContribution={summary.monthlyNet}
            loading={!hydrated}
          />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
            Goal plans
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {hydrated
              ? goalPlanCards.map((g) => (
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
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <PrimaryGoalCard
                    key={`skeleton-${i}`}
                    name=""
                    targetAmount={0}
                    saved={0}
                    loading
                  />
                ))}
          </div>
        </section>

        <section className="mt-8">
          <MetricGrid
            totalAssets={summary.totalAssets}
            activeIncome={summary.activeIncome}
            passiveIncome={summary.passiveIncome}
            averageMonthlySpending={summary.averageSpending}
            monthlyNetSavings={summary.monthlyNet}
            totalDebt={summary.totalDebt}
            eoyProjection={summary.eoyProjection}
            loading={!hydrated}
          />
        </section>
      </Main>
    </>
  );
}
