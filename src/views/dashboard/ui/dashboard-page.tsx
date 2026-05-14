"use client";

import { useEffect, useMemo } from "react";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
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

import { FinancialSummaryWidget } from "./financial-summary-widget";
import { MetricGrid } from "./metric-grid";
import { MillionBy35Card } from "./million-by-35-card";
import { PrimaryGoalCard } from "./primary-goal-card";

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
    (primaryProfile?.name?.trim() || goals.primary.name?.trim()) ?? "Primary Goal";
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
        saved: totalGoalStartingBalance(plan.seedLines, seedOptions, goals.profiles, plan),
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
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Your net worth, goal plans, and monthly trajectory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FinancialSummaryWidget
            totalAssets={financialBreakdown.totalAssets}
            totalLiabilities={financialBreakdown.totalLiabilities}
            portfolioDetailTotal={financialBreakdown.portfolioDetailTotal}
            assetConfigurationTotal={financialBreakdown.assetConfigurationTotal}
          />
          <MillionBy35Card
            currentNetWorth={summary.totalNetWorth}
            monthlyNetContribution={summary.monthlyNet}
          />
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Goal plans
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <section className="mt-6">
          <MetricGrid
            totalAssets={summary.totalAssets}
            activeIncome={summary.activeIncome}
            passiveIncome={summary.passiveIncome}
            totalDebt={summary.totalDebt}
            eoyProjection={summary.eoyProjection}
          />
        </section>
      </Main>
    </>
  );
}
