"use client";

import { useState } from "react";

import { formatVnd } from "@/shared/lib";
import { Card, MaterialIcon } from "@/shared/ui";

import { MiniLineChart } from "./MiniLineChart";

type NetWorthCardProps = {
  totalNetWorth: number;
  monthChangePct: number;
};

const RANGE_OPTIONS = ["YTD", "1Y", "5Y"] as const;

export function NetWorthCard({ totalNetWorth, monthChangePct }: NetWorthCardProps) {
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>("YTD");

  return (
    <Card className="lg:col-span-2 p-6">
      <div className="flex justify-between items-start mb-stack-lg">
        <div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            Total Net Worth
          </h3>
          <div className="font-headline-lg text-headline-lg text-primary">
            {formatVnd(totalNetWorth)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-secondary">
            <MaterialIcon name="trending_up" size={16} />
            <span className="font-data-tabular text-data-tabular">
              {monthChangePct >= 0 ? "+" : ""}
              {monthChangePct.toFixed(1)}% This Month
            </span>
          </div>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as (typeof RANGE_OPTIONS)[number])}
          className="bg-surface border border-outline-variant text-on-surface font-label-sm text-label-sm rounded h-8 px-2 py-0 focus:border-secondary focus:ring-0"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <MiniLineChart />
    </Card>
  );
}
