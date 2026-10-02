import type { GoalProjectionSummary } from "@/entities/goal";
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
  return (
    <Section title="Feasibility" description="How the projection is calculated.">
      <DescriptionList
        items={[
          {
            label: "Status",
            value:
              projection.status === "unset" ? (
                "—"
              ) : projection.status === "feasible" ? (
                <StatusBadge tone="success" dot>Feasible</StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>Shortfall</StatusBadge>
              ),
          },
          ...(incomeMonthly > 0 ? [{ label: "Household income", value: <Money value={incomeMonthly} /> }] : []),
          {
            label: "Monthly savings for this plan",
            value: <Money value={projection.effectiveMonthlyContribution} signed tone="auto" />,
            hint: !projection.applyMonthlyIncome
              ? "Monthly income is excluded from this plan."
              : projection.incomeOffsetBySpending
                ? "Income is offset by average monthly spending."
                : `${formatPercent(projection.monthlyShare * 100, { maximumFractionDigits: 0 })} of your monthly savings`,
          },
          { label: "Allocated starting total", value: <Money value={startingBalance} /> },
          {
            label: "Expected yearly return",
            value: projection.annualReturn > 0 ? formatPercent(projection.annualReturn * 100) : "None",
            hint: projection.annualReturn > 0 ? "Compounded monthly on the plan balance." : undefined,
          },
          { label: "Time to target", value: projection.pastDue ? "Date passed" : formatMonths(projection.monthsToTarget) },
          { label: "Projected balance at date", value: <Money value={projection.projectedAtTarget} /> },
          { label: "Goal target", value: <Money value={targetAmount} />, emphasis: true },
        ]}
      />
    </Section>
  );
}
