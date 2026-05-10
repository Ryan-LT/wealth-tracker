"use client";

import { useMemo, useState } from "react";

import { cn, formatVnd } from "@/shared/lib";
import type { Transaction } from "@/shared/storage";
import { Badge, Card } from "@/shared/ui";

import { CashFlowFilters } from "./CashFlowFilters";

type CashFlowHistoryTableProps = {
  transactions: Transaction[];
};

export function CashFlowHistoryTable({ transactions }: CashFlowHistoryTableProps) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [visibleCount, setVisibleCount] = useState(transactions.length);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return ["All Categories", ...Array.from(set)];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (date ? t.date === date : true))
      .filter((t) => (category === "All Categories" ? true : t.category === category))
      .slice(0, visibleCount);
  }, [transactions, date, category, visibleCount]);

  return (
    <Card className="lg:col-span-12 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="font-headline-md text-headline-md text-primary">Cash Flow History</h3>
        <CashFlowFilters
          date={date}
          onDateChange={setDate}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />
      </div>

      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Category
              </th>
              <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                Native Amount
              </th>
              <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                USD Equivalent
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/50">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-data-tabular text-data-tabular text-primary">
                  {t.date}
                </td>
                <td className="py-4 px-6 font-body-md text-body-md text-primary font-medium">
                  {t.description}
                </td>
                <td className="py-4 px-6">
                  <Badge tone="tag">{t.category}</Badge>
                </td>
                <td
                  className={cn(
                    "py-4 px-6 font-data-tabular text-data-tabular text-right",
                    t.vndAmount < 0 ? "text-error" : "text-secondary",
                  )}
                >
                  {t.nativeAmount}
                </td>
                <td
                  className={cn(
                    "py-4 px-6 font-data-tabular text-data-tabular text-right",
                    t.vndAmount < 0 ? "text-error" : "text-secondary",
                  )}
                >
                  {formatVnd(t.vndAmount, { decimals: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleCount < transactions.length ? (
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 10)}
            className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-container transition-colors uppercase tracking-wider"
          >
            Load More History
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Load More History
          </span>
        </div>
      )}
    </Card>
  );
}
