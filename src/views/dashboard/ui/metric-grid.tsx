import { formatVnd } from "@/shared/lib";

import { MetricCard } from "./metric-card";

type MetricGridProps = {
  activeIncome: number;
  passiveIncome: number;
  averageMonthlySpending: number;
  totalDebt: number;
  loading?: boolean;
};

export function MetricGrid({
  activeIncome,
  passiveIncome,
  averageMonthlySpending,
  totalDebt,
  loading = false,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricCard
        variant="secondary"
        icon="work"
        label="Active income"
        value={formatVnd(activeIncome)}
        hint="/ month average"
        loading={loading}
      />
      <MetricCard
        variant="secondary"
        icon="savings"
        label="Passive income"
        value={formatVnd(passiveIncome)}
        hint="/ month average"
        loading={loading}
      />
      <MetricCard
        variant="outflow"
        icon="payments"
        label="Avg spending"
        value={formatVnd(averageMonthlySpending)}
        hint="Settings · / month"
        negative={averageMonthlySpending > 0}
        loading={loading}
      />
      <MetricCard
        variant="outflow"
        icon="credit_card"
        label="Total debt"
        value={formatVnd(totalDebt)}
        hint="Mortgage excluded"
        negative
        loading={loading}
      />
    </div>
  );
}
