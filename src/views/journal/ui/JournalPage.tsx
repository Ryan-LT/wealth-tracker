"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";

import { resolvedMonthlyCashflowDisplay } from "@/shared/lib";
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

  const monthlyCashflow = useMemo(
    () => resolvedMonthlyCashflowDisplay(transactions, prefs),
    [transactions, prefs],
  );

  return (
    <>
      <TopAppBar
        start={
          <div className="flex min-w-0 flex-1 max-w-full items-center gap-stack-sm text-on-surface-variant sm:max-w-md">
            <TextField
              type="search"
              placeholder="Search transactions..."
              variant="standard"
              size="small"
              fullWidth
              hiddenLabel
              slotProps={{
                htmlInput: {
                  "aria-label": "Search transactions",
                },
                input: {
                  disableUnderline: false,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MaterialIcon name="search" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiInput-root": {
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  color: "var(--color-on-surface-variant)",
                },
                "& .MuiInput-root:before": {
                  borderBottomColor: "var(--color-outline-variant)",
                },
                "& .MuiInput-root:after": {
                  borderBottomColor: "var(--color-secondary)",
                },
              }}
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
          <MonthlySummaryCard
            inflow={monthlyCashflow.inflow}
            outflow={monthlyCashflow.outflow}
          />

          <IncomeSourcesPanel title="Salary & Active Income" sources={active} />
          <IncomeSourcesPanel title="Passive Income Sources" sources={passive} />

          <CashFlowHistoryTable transactions={transactions} />
        </div>
      </main>
    </>
  );
}
