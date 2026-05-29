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
    <div className="flex flex-col gap-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
        Key figures
      </p>
      <div className="flex flex-wrap gap-4">
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

      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
        Breakdown
      </p>
      <div className="flex flex-wrap gap-4">
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
