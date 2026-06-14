import { formatVnd } from "@/shared/lib";

import { MetricCard } from "./metric-card";

type MetricGridProps = {
  totalAssets: number;
  activeIncome: number;
  passiveIncome: number;
  averageMonthlySpending: number;
  monthlyNetSavings: number;
  totalDebt: number;
  eoyProjection: number;
  loading?: boolean;
};

export function MetricGrid({
  totalAssets,
  activeIncome,
  passiveIncome,
  averageMonthlySpending,
  monthlyNetSavings,
  totalDebt,
  eoyProjection,
  loading = false,
}: MetricGridProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <p className="section-label">Key figures</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          variant="primary"
          icon="account_balance"
          label="Total Assets"
          value={formatVnd(totalAssets)}
          hint="Catalog + portfolio detail"
          loading={loading}
        />
        <MetricCard
          variant="primary"
          icon="account_balance_wallet"
          label="Monthly Net"
          value={formatVnd(monthlyNetSavings)}
          hint="Income − spending"
          highlight
          negative={monthlyNetSavings < 0}
          loading={loading}
        />
        <MetricCard
          variant="secondary"
          icon="event"
          label="EOY Projection"
          value={formatVnd(eoyProjection)}
          hint="Based on current trajectory"
          loading={loading}
        />
      </div>

      <p className="section-label pt-1 sm:pt-0">Breakdown</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          variant="secondary"
          icon="work"
          label="Active Income"
          value={formatVnd(activeIncome)}
          hint="/ Month Avg"
          loading={loading}
        />
        <MetricCard
          variant="secondary"
          icon="savings"
          label="Passive Income"
          value={formatVnd(passiveIncome)}
          hint="/ Month Avg"
          loading={loading}
        />
        <MetricCard
          variant="outflow"
          icon="payments"
          label="Avg Spending"
          value={formatVnd(averageMonthlySpending)}
          hint="Settings · / Month"
          negative={averageMonthlySpending > 0}
          loading={loading}
        />
        <MetricCard
          variant="outflow"
          icon="credit_card"
          label="Total Debt"
          value={formatVnd(totalDebt)}
          hint="Mortgage excluded"
          negative
          loading={loading}
        />
      </div>
    </div>
  );
}
