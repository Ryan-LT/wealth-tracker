"use client";

import type { LucideIcon } from "lucide-react";
import { Flame, HandCoins, LifeBuoy, Percent, Scale, Waves } from "lucide-react";
import type { ReactNode } from "react";

import type { FinancialHealth } from "@/entities/portfolio";
import { cn } from "@/shared/lib/cn";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import type { StatusTone } from "@/shared/lib/tone";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";

const TONE_TEXT: Record<StatusTone, string> = {
  neutral: "",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

function Metric({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  verdict,
  explain,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  tone?: StatusTone;
  verdict?: string;
  explain: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5 rounded-md border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          {label}
        </p>
        {verdict ? (
          <StatusBadge tone={tone} dot>
            {verdict}
          </StatusBadge>
        ) : null}
      </div>
      <p className={cn("text-xl font-semibold tracking-tight normal-nums", TONE_TEXT[tone])}>{value}</p>
      <p className="text-xs text-muted-foreground">{explain}</p>
    </div>
  );
}

const pct = (fraction: number) => formatPercent(fraction * 100, { maximumFractionDigits: 0 });
const months = (n: number) => `${formatNumber(n, { maximumFractionDigits: 1 })} ${n === 1 ? "month" : "months"}`;

/** Six plain-language health checks computed from the user's tables. */
export function FinancialHealthCard({ health, annualRealRate }: { health: FinancialHealth; annualRealRate: number }) {
  const h = health;
  const emergencyTone: StatusTone =
    h.emergencyMonths === null ? "neutral" : h.emergencyMonths >= 6 ? "success" : h.emergencyMonths >= 3 ? "warning" : "danger";
  const debtTone: StatusTone =
    h.debtToAssets === null ? "neutral" : h.debtToAssets <= 0.3 ? "success" : h.debtToAssets <= 0.5 ? "warning" : "danger";
  const liquidTone: StatusTone = h.liquidShare === null ? "neutral" : h.liquidShare >= 0.1 ? "success" : "warning";

  return (
    <Section title="Financial health" description="Quick checks from your assets, debts, income and spending.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric
          icon={LifeBuoy}
          label="Emergency fund"
          value={h.emergencyMonths === null ? "—" : months(h.emergencyMonths)}
          tone={emergencyTone}
          verdict={h.emergencyMonths === null ? undefined : h.emergencyMonths >= 6 ? "Healthy" : h.emergencyMonths >= 3 ? "Okay" : "Low"}
          explain={
            h.emergencyMonths === null ? (
              "Set your average spending to see this."
            ) : (
              <>
                <Money value={h.instantAssets} compact /> of instant-access money covers this long without income. 3–6 months is the usual
                advice.
              </>
            )
          }
        />
        <Metric
          icon={Flame}
          label="Financial independence"
          value={h.fiProgress === null ? "—" : pct(h.fiProgress)}
          tone={h.fiProgress !== null && h.fiProgress >= 1 ? "success" : "neutral"}
          verdict={h.fiProgress !== null && h.fiProgress >= 1 ? "Reached" : undefined}
          explain={
            h.fiNumber === null ? (
              "Set your average spending to see this."
            ) : (
              <>
                Of <Money value={h.fiNumber} compact /> (25× yearly spending).{" "}
                {h.fiProgress !== null && h.fiProgress >= 1
                  ? "Your net worth could cover spending at a 4 % yearly withdrawal."
                  : h.yearsToFi === null
                    ? "Not reachable at the current monthly savings."
                    : `About ${formatNumber(h.yearsToFi, { maximumFractionDigits: 1 })} years at the current savings${annualRealRate > 0 ? ` and ${formatPercent(annualRealRate * 100)} real growth` : ""}.`}
              </>
            )
          }
        />
        <Metric
          icon={HandCoins}
          label="Passive income covers"
          value={h.passiveCoverage === null ? "—" : pct(h.passiveCoverage)}
          tone={h.passiveCoverage !== null && h.passiveCoverage >= 1 ? "success" : "neutral"}
          explain={h.passiveCoverage === null ? "Set your average spending to see this." : "Share of your monthly spending paid by passive income (interest, rent)."}
        />
        <Metric
          icon={Scale}
          label="Debt to assets"
          value={h.debtToAssets === null ? "—" : pct(h.debtToAssets)}
          tone={debtTone}
          verdict={h.debtToAssets === null ? undefined : h.debtToAssets <= 0.3 ? "Low" : h.debtToAssets <= 0.5 ? "Moderate" : "High"}
          explain="What you owe as a share of what you own. Under 30 % is comfortable."
        />
        <Metric
          icon={Waves}
          label="Liquid assets"
          value={h.liquidShare === null ? "—" : pct(h.liquidShare)}
          tone={liquidTone}
          explain="Share of your assets you can use right away (cash and instant-access)."
        />
        <Metric
          icon={Percent}
          label="Interest cost"
          value={<Money value={h.monthlyInterest} compact />}
          tone={h.monthlyInterest > 0 ? "danger" : "neutral"}
          explain={h.monthlyInterest > 0 ? "Interest your debts add each month (balance × rate ÷ 12)." : "No interest-bearing debt."}
        />
      </div>
    </Section>
  );
}
