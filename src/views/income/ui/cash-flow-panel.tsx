"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownLeft, ArrowUpRight, Equal, Minus, PiggyBank, Plus, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import type { CashflowSummary } from "@/entities/portfolio";
import { useI18n } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { formatPercent } from "@/shared/lib/format";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Money } from "@/shared/ui/money";

import { SpendingForm } from "./spending-form";

const TONES = {
  in: { circle: "bg-success-muted text-success", amount: "text-success" },
  out: { circle: "bg-danger-muted text-danger", amount: "text-danger" },
} as const;

function FlowCard({
  tone,
  icon: Icon,
  title,
  caption,
  amount,
  children,
}: {
  tone: keyof typeof TONES;
  icon: LucideIcon;
  title: string;
  caption: string;
  amount: number;
  children: ReactNode;
}) {
  return (
    <Card className="gap-4 px-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", TONES[tone].circle)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{caption}</p>
        </div>
      </div>
      <p className={cn("text-2xl font-semibold tracking-tight normal-nums", TONES[tone].amount)}>
        <Money value={amount} />
      </p>
      {children}
    </Card>
  );
}

/** "−" / "=" between the cards: a column on desktop, a row on phones. */
function Operator({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span className="flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground" title={label}>
        <Icon className="size-4" />
      </span>
    </div>
  );
}

/** Income vs spending as one bar: the spent share and the share left to save. */
function SplitBar({ income, spending }: { income: number; spending: number }) {
  const { t } = useI18n();
  if (income <= 0) return null;
  const spentShare = Math.min(1, spending / income);
  const saveShare = 1 - spentShare;
  const spent = formatPercent(spentShare * 100, { maximumFractionDigits: 0 });
  const save = formatPercent(saveShare * 100, { maximumFractionDigits: 0 });
  const label = t.income.cashFlow.splitLabel({ spent, save });
  return (
    <div className="grid gap-2">
      <div role="img" aria-label={label} className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-danger" style={{ width: `${spentShare * 100}%` }} />
        <div className="h-full bg-success" style={{ width: `${saveShare * 100}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-danger" />
          {t.income.cashFlow.splitSpending({ pct: spent })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" />
          {t.income.cashFlow.splitSaving({ pct: save })}
        </span>
      </div>
    </div>
  );
}

/**
 * The page's main read: money in and money out side by side, then what's left.
 * Spending is edited right here so it can't be overlooked.
 */
export function CashFlowPanel({
  cash,
  sourceCount,
  onAddSource,
  onSaveSpending,
}: {
  cash: CashflowSummary;
  sourceCount: number;
  onAddSource: () => void;
  onSaveSpending: (amount: number) => void;
}) {
  const { t } = useI18n();
  const savingsRate = cash.totalIncome > 0 ? (cash.monthlyNet / cash.totalIncome) * 100 : null;
  const overspending = cash.monthlyNet < 0;

  return (
    <section aria-label={t.income.cashFlow.ariaLabel} className="grid gap-3">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
        <FlowCard
          tone="in"
          icon={ArrowDownLeft}
          title={t.income.cashFlow.moneyIn}
          caption={t.income.cashFlow.moneyInCaption({ count: sourceCount })}
          amount={cash.totalIncome}
        >
          <dl className="grid gap-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t.income.cashFlow.activeRow}</dt>
              <dd className="font-medium tabular-nums">
                <Money value={cash.activeIncome} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t.income.cashFlow.passiveRow}</dt>
              <dd className="font-medium tabular-nums">
                <Money value={cash.passiveIncome} />
              </dd>
            </div>
          </dl>
          {/* The page header has the same action; this one is for wide screens where it sits next to the total. */}
          <div className="mt-auto max-md:hidden">
            <Button variant="outline" size="sm" onClick={onAddSource}>
              <Plus />
              {t.income.addSource}
            </Button>
          </div>
        </FlowCard>

        <Operator icon={Minus} label={t.income.cashFlow.minus} />

        <FlowCard tone="out" icon={ArrowUpRight} title={t.income.cashFlow.moneyOut} caption={t.income.cashFlow.moneyOutCaption} amount={cash.averageSpending}>
          <p className="text-sm text-muted-foreground">{t.income.cashFlow.moneyOutHint}</p>
          <div className="mt-auto">
            <SpendingForm value={cash.averageSpending} onSave={onSaveSpending} label={t.income.cashFlow.updateSpending} />
          </div>
        </FlowCard>
      </div>

      <Operator icon={Equal} label={t.income.cashFlow.equals} />

      <Card className="gap-4 px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                overspending ? "bg-danger-muted text-danger" : "bg-primary-soft text-primary-soft-foreground",
              )}
            >
              {overspending ? <TriangleAlert className="size-5" aria-hidden /> : <PiggyBank className="size-5" aria-hidden />}
            </span>
            <div>
              <h2 className="text-base font-semibold">{overspending ? t.income.cashFlow.overspending : t.income.cashFlow.leftToSave}</h2>
              <p className="text-sm text-muted-foreground">{t.income.cashFlow.usedIn}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-tight normal-nums">
              <Money value={cash.monthlyNet} signed tone="auto" />
            </p>
            <p className="text-xs text-muted-foreground">
              {savingsRate === null
                ? t.income.cashFlow.noRate
                : t.income.cashFlow.savingsRate({ pct: formatPercent(savingsRate, { maximumFractionDigits: 0 }) })}
            </p>
          </div>
        </div>
        <SplitBar income={cash.totalIncome} spending={cash.averageSpending} />
      </Card>
    </section>
  );
}
