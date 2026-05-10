"use client";

import { useMemo } from "react";

import {
  monthlyIncomeByKind,
  totalAssetValue,
  totalDebtBalance,
} from "@/shared/lib";
import {
  ACTIVITY_SEED,
  ASSETS_SEED,
  DEBTS_SEED,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
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
  const [activity] = useTable("activity", ACTIVITY_SEED);

  const summary = useMemo(() => {
    const grossAssets = totalAssetValue(assets);
    const liabilities = totalDebtBalance(debts);
    const netWorth = grossAssets - liabilities;
    return {
      totalNetWorth: netWorth,
      monthChangePct: 0,
      activeIncome: monthlyIncomeByKind(sources, "active"),
      passiveIncome: monthlyIncomeByKind(sources, "passive"),
      totalDebt: -liabilities,
      eoyProjection: 0,
    };
  }, [assets, debts, sources]);

  return (
    <>
      <TopAppBar
        start={
          <h2 className="text-headline-md font-headline-md text-primary md:hidden">
            WealthTracker
          </h2>
        }
      />
      <main className="flex-1 p-margin-mobile md:p-gutter max-w-container-max mx-auto w-full pb-24 md:pb-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md mb-stack-lg">
          <NetWorthCard
            totalNetWorth={summary.totalNetWorth}
            monthChangePct={summary.monthChangePct}
          />
          <PrimaryGoalCard
            name={goals.primary.name}
            targetAmount={goals.primary.targetAmount}
            saved={goals.primary.saved}
          />
        </div>

        <MetricGrid
          activeIncome={summary.activeIncome}
          passiveIncome={summary.passiveIncome}
          totalDebt={summary.totalDebt}
          eoyProjection={summary.eoyProjection}
        />

        <RecentActivityTable rows={activity} />
      </main>
    </>
  );
}
