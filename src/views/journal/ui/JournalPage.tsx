"use client";

import { useMemo } from "react";

import {
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  TRANSACTIONS_SEED,
  useTable,
} from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";
import { TopAppBar } from "@/widgets/top-app-bar";

import { CashFlowHistoryTable } from "./CashFlowHistoryTable";
import { IncomeSourcesPanel } from "./IncomeSourcesPanel";
import { MonthlySummaryCard } from "./MonthlySummaryCard";
import { NetIncomeInputCard } from "./NetIncomeInputCard";

export function JournalPage() {
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [transactions] = useTable("transactions", TRANSACTIONS_SEED);

  const { active, passive } = useMemo(() => {
    return {
      active: sources.filter((s) => s.kind === "active"),
      passive: sources.filter((s) => s.kind === "passive"),
    };
  }, [sources]);

  return (
    <>
      <TopAppBar
        start={
          <div className="flex items-center gap-stack-sm w-full max-w-md text-on-surface-variant">
            <MaterialIcon name="search" />
            <input
              type="search"
              placeholder="Search transactions..."
              className="flex-1 bg-transparent outline-none border-0 font-body-md text-body-md placeholder:text-on-surface-variant"
            />
          </div>
        }
      />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg space-y-stack-lg pb-24 md:pb-8">
        <header className="flex flex-col gap-1 mb-8">
          <h2 className="font-headline-lg text-headline-lg text-primary">
            Income &amp; Expense Journal
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Log and track your cash flow across all asset classes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md">
          <NetIncomeInputCard
            initialValue={prefs.netMonthIncome}
            onUpdate={(netMonthIncome) => setPrefs((p) => ({ ...p, netMonthIncome }))}
          />
          <MonthlySummaryCard inflow={prefs.monthInflow} outflow={prefs.monthOutflow} />

          <IncomeSourcesPanel title="Salary & Active Income" sources={active} />
          <IncomeSourcesPanel title="Passive Income Sources" sources={passive} />

          <CashFlowHistoryTable transactions={transactions} />
        </div>
      </main>
    </>
  );
}
