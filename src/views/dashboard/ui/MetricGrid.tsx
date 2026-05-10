import { formatVnd } from "@/shared/lib";

import { MetricCard } from "./MetricCard";

type MetricGridProps = {
  activeIncome: number;
  passiveIncome: number;
  totalDebt: number;
  eoyProjection: number;
};

export function MetricGrid({
  activeIncome,
  passiveIncome,
  totalDebt,
  eoyProjection,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md mb-stack-lg">
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
