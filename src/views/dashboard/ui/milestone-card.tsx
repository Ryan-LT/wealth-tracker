"use client";

import { CircleCheck, RotateCw, TriangleAlert } from "lucide-react";

import { feasibilityToneMeta } from "@/entities/goal/ui";
import {
  analyzeMilestone35,
  DEFAULT_MILESTONE_USD,
  MILESTONE_TARGET_AGE,
  milestoneChipDetail,
  milestoneHint,
  type MilestoneFormatters,
} from "@/entities/milestone";
import { useMilestone35Config } from "@/entities/milestone/api/use-milestone-config";
import { formatDate, formatMoney, formatMonths, formatUsd, formatUsdCompact } from "@/shared/lib/format";
import { Callout } from "@/shared/ui/callout";
import { DescriptionList } from "@/shared/ui/description-list";
import { Button } from "@/shared/ui/kit/button";
import { Progress } from "@/shared/ui/kit/progress";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";

const FMT: MilestoneFormatters = {
  money: (n, o) => formatMoney(n, { signDisplay: o?.signed ? "always" : "auto" }),
  usd: formatUsd,
};

function title(targetUsd: number) {
  return `${formatUsdCompact(targetUsd)} by ${MILESTONE_TARGET_AGE}`;
}

export function MilestoneCard({ netWorth, monthlyNet }: { netWorth: number; monthlyNet: number }) {
  const { config, error, reload } = useMilestone35Config();

  if (error) {
    return (
      <Section title={title(DEFAULT_MILESTONE_USD)}>
        <Callout tone="danger" title="Couldn't load milestone settings">
          {error}
          <Button variant="outline" size="sm" className="mt-2" onClick={reload}>
            <RotateCw />
            Retry
          </Button>
        </Callout>
      </Section>
    );
  }

  if (!config) {
    return (
      <Section title={title(DEFAULT_MILESTONE_USD)}>
        <div className="grid gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-1.5 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Section>
    );
  }

  const a = analyzeMilestone35({ config, currentNetWorth: netWorth, monthlyNetContribution: monthlyNet });
  const hint = milestoneHint(a, FMT);

  if (a.kind === "incomplete") {
    return (
      <Section title={title(a.targetUsd)} description="Net worth target by your 35th birthday.">
        <Callout tone="info" title="Finish setup to track this milestone">
          {hint}
        </Callout>
      </Section>
    );
  }

  const badge =
    a.kind === "achieved"
      ? { tone: "success" as const, icon: CircleCheck, label: "Target met" }
      : a.kind === "past_deadline"
        ? { tone: "danger" as const, icon: TriangleAlert, label: "Past milestone" }
        : { tone: feasibilityToneMeta(a.tone).status, icon: feasibilityToneMeta(a.tone).icon, label: a.label };
  const detail = milestoneChipDetail(a, netWorth, FMT);

  return (
    <Section
      title={title(a.targetUsd)}
      description={`Deadline ${formatDate(a.deadline)}`}
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              <StatusBadge tone={badge.tone} icon={badge.icon}>
                {badge.label}
              </StatusBadge>
            </span>
          </TooltipTrigger>
          {hint ? <TooltipContent>{hint}</TooltipContent> : null}
        </Tooltip>
      }
    >
      <div className="grid gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight">
            <Money value={netWorth} compact className="normal-nums" />
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={a.pct} className="flex-1" />
            <span className="w-10 text-right text-xs font-medium tabular-nums">{a.pct}%</span>
          </div>
          {detail ? <p className="mt-1.5 text-xs text-muted-foreground">{detail} vs target</p> : null}
        </div>
        <DescriptionList
          items={[
            {
              label: "Target",
              value: (
                <span>
                  <Money value={a.targetVnd} compact /> <span className="text-xs text-muted-foreground">≈ {formatUsd(a.targetUsd)}</span>
                </span>
              ),
            },
            ...(a.kind === "projection"
              ? [
                  { label: `Projected at ${MILESTONE_TARGET_AGE}`, value: <Money value={a.projectedEndingNetWorth} compact /> },
                  { label: "Time left", value: formatMonths(a.monthsRemaining) },
                ]
              : []),
          ]}
        />
      </div>
    </Section>
  );
}
