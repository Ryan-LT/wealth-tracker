"use client";

import { useEffect, useMemo } from "react";

import {
  buildNetWorthChartSeries,
  formatVnd,
  monthlyIncomeByKind,
  monthToDateNetWorthChangePercent,
  projectNetWorthEndOfYear,
  syncNetWorthTracking,
  totalAssetValue,
  totalDebtBalance,
  totalMonthlyIncomeFromSources,
  transactionsToActivityRows,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  DEBTS_SEED,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  TRANSACTIONS_SEED,
  type AssetsState,
  useTable,
} from "@/shared/storage";
import { TopAppBar } from "@/widgets/top-app-bar";

import { MetricGrid } from "./MetricGrid";
import { NetWorthCard } from "./NetWorthCard";
import { PrimaryGoalCard } from "./PrimaryGoalCard";
import { RecentActivityTable } from "./RecentActivityTable";

export function DashboardPage() {
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [debts] = useTable("debts", DEBTS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [goals] = useTable("goals", GOALS_SEED);
  const [transactions] = useTable("transactions", TRANSACTIONS_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const netWorth = useMemo(() => {
    const gross = totalAssetValue(assets);
    const liabilities = totalDebtBalance(debts);
    return gross - liabilities;
  }, [assets, debts]);

  useEffect(() => {
    setPrefs((p) => syncNetWorthTracking(p, netWorth));
  }, [netWorth, setPrefs]);

  const summary = useMemo(() => {
    const grossAssets = totalAssetValue(assets);
    const liabilities = totalDebtBalance(debts);
    const nw = grossAssets - liabilities;
    const incomeTotal = totalMonthlyIncomeFromSources(sources);
    return {
      totalNetWorth: nw,
      monthChangePct: monthToDateNetWorthChangePercent(prefs, nw),
      activeIncome: monthlyIncomeByKind(sources, "active"),
      passiveIncome: monthlyIncomeByKind(sources, "passive"),
      totalDebt: -liabilities,
      eoyProjection: projectNetWorthEndOfYear(nw, prefs, incomeTotal),
    };
  }, [assets, debts, sources, prefs]);

  const chartSeries = useMemo(
    () => buildNetWorthChartSeries(prefs.netWorthMonthlyHistory ?? [], netWorth),
    [prefs.netWorthMonthlyHistory, netWorth],
  );

  const activityRows = useMemo(
    () => transactionsToActivityRows(transactions),
    [transactions],
  );

  const primaryProfile =
    goals.profiles.find((p) => p.id === goals.activeProfileId) ??
    goals.profiles[0];

  const primaryTarget =
    primaryProfile?.targetAmount ?? goals.primary.targetAmount;
  const primaryName =
    (primaryProfile?.name?.trim() || goals.primary.name?.trim()) ?? "Primary Goal";
  const savedTowardPrimary =
    goals.primary.saved > 0
      ? Math.min(goals.primary.saved, primaryTarget)
      : Math.min(Math.max(0, netWorth), primaryTarget);

  return (
    <>
      <TopAppBar
        start={
          <h2 className="text-headline-md font-headline-md text-primary md:hidden">
            WealthTracker
          </h2>
        }
        metricLabel="Metric: Net Worth"
        metricValue={formatVnd(summary.totalNetWorth)}
      />
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full pb-24 md:pb-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md mb-stack-lg">
          <NetWorthCard
            totalNetWorth={summary.totalNetWorth}
            monthChangePct={summary.monthChangePct}
            chartLabels={chartSeries.labels}
            chartValues={chartSeries.values}
          />
          <PrimaryGoalCard
            name={primaryName}
            targetAmount={primaryTarget}
            saved={savedTowardPrimary}
          />
        </div>

        <MetricGrid
          activeIncome={summary.activeIncome}
          passiveIncome={summary.passiveIncome}
          totalDebt={summary.totalDebt}
          eoyProjection={summary.eoyProjection}
        />

        <RecentActivityTable rows={activityRows} />
      </main>
    </>
  );
}
