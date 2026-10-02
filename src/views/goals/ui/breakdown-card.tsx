import type { GoalProjectionSummary } from "@/entities/goal";
import { useI18n } from "@/shared/i18n";
import { formatMonths, formatPercent } from "@/shared/lib/format";
import { DescriptionList } from "@/shared/ui/description-list";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";

type BreakdownCardProps = {
  projection: GoalProjectionSummary;
  incomeMonthly: number;
  startingBalance: number;
  targetAmount: number;
};

/** Every number behind the feasibility verdict. */
export function BreakdownCard({ projection, incomeMonthly, startingBalance, targetAmount }: BreakdownCardProps) {
  const { t } = useI18n();
  const b = t.goals.breakdown;
  return (
    <Section title={b.title} description={b.description}>
      <DescriptionList
        items={[
          {
            label: b.status,
            value:
              projection.status === "unset" ? (
                "—"
              ) : projection.status === "feasible" ? (
                <StatusBadge tone="success" dot>{t.goals.status.feasible}</StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>{t.goals.status.shortfall}</StatusBadge>
              ),
          },
          ...(incomeMonthly > 0 ? [{ label: b.householdIncome, value: <Money value={incomeMonthly} /> }] : []),
          {
            label: b.monthly,
            value: <Money value={projection.effectiveMonthlyContribution} signed tone="auto" />,
            hint: !projection.applyMonthlyIncome
              ? b.incomeExcluded
              : projection.incomeOffsetBySpending
                ? b.incomeOffset
                : b.shareHint({ pct: formatPercent(projection.monthlyShare * 100, { maximumFractionDigits: 0 }) }),
          },
          { label: b.allocatedTotal, value: <Money value={startingBalance} /> },
          {
            label: b.expectedReturn,
            value: projection.annualReturn > 0 ? formatPercent(projection.annualReturn * 100) : t.common.none,
            hint: projection.annualReturn > 0 ? b.compounded : undefined,
          },
          { label: b.timeToTarget, value: projection.pastDue ? t.goals.status.datePassed : formatMonths(projection.monthsToTarget) },
          { label: b.projectedAtDate, value: <Money value={projection.projectedAtTarget} /> },
          { label: b.goalTarget, value: <Money value={targetAmount} />, emphasis: true },
        ]}
      />
    </Section>
  );
}
