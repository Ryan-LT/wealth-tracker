import { formatVnd } from "@/shared/lib";

import { MetricCard } from "./metric-card";

type MetricGridProps = {
  totalAssets: number;
  activeIncome: number;
  passiveIncome: number;
  totalDebt: number;
  eoyProjection: number;
};

export function MetricGrid({
  totalAssets,
  activeIncome,
  passiveIncome,
  totalDebt,
  eoyProjection,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        icon="account_balance"
        label="Total Assets"
        value={formatVnd(totalAssets)}
        hint="Catalog + portfolio detail"
      />
      <MetricCard
        icon="work"
        label="Active Income"
        value={formatVnd(activeIncome)}
        hint="/ Month Avg"
      />
      <MetricCard
        icon="savings"
        label="Passive Income"
        value={formatVnd(passiveIncome)}
        hint="/ Month Avg"
      />
      <MetricCard
        icon="credit_card"
        label="Total Debt"
        value={formatVnd(totalDebt)}
        hint="Mortgage excluded"
        negative
      />
      <MetricCard
        icon="event"
        label="EOY Projection"
        value={formatVnd(eoyProjection)}
        hint="Based on current trajectory"
        highlight
      />
    </div>
  );
}
