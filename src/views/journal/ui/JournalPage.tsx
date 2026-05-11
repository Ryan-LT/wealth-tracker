"use client";

import { useMemo } from "react";

import { resolvedMonthlyCashflowDisplay } from "@/shared/lib";
import {
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  TRANSACTIONS_SEED,
  useTable,
} from "@/shared/storage";

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

  const monthlyCashflow = useMemo(
    () => resolvedMonthlyCashflowDisplay(transactions, prefs),
    [transactions, prefs],
  );

  return (
    <>
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
            onUpdate={(netMonthIncome) =>
              setPrefs((p) => ({ ...p, netMonthIncome }))
            }
          />
          <MonthlySummaryCard
            inflow={monthlyCashflow.inflow}
            outflow={monthlyCashflow.outflow}
          />

          <IncomeSourcesPanel title="Salary & Active Income" sources={active} />
          <IncomeSourcesPanel
            title="Passive Income Sources"
            sources={passive}
          />

          <CashFlowHistoryTable transactions={transactions} />
        </div>
      </main>
    </>
  );
}
