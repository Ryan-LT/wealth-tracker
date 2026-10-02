"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { GoalProfile } from "@/entities/goal";
import { formatDate, formatPercent } from "@/shared/lib/format";
import { DescriptionList } from "@/shared/ui/description-list";
import { Callout } from "@/shared/ui/callout";
import { DateField, MoneyField, PercentField, SegmentedField, SwitchField, TextField } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Form } from "@/shared/ui/kit/form";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";

const schema = z.object({
  name: z.string().max(80),
  targetAmount: z.number().min(0),
  targetDate: z.string(),
  includeMonthlyIncome: z.boolean(),
  shareMode: z.enum(["auto", "custom"]),
  sharePct: z.number().min(0).max(100),
  expectedReturnPct: z.number().min(0).max(30),
});

type FormValues = z.infer<typeof schema>;

/** What the plan stores: an explicit share only in "custom" mode, a return only when > 0. */
type Values = {
  name: string;
  targetAmount: number;
  targetDate: string;
  includeMonthlyIncome: boolean;
  monthlySharePct?: number;
  expectedReturnPct?: number;
};

function toPlanValues(v: Partial<FormValues>): Values {
  return {
    name: v.name ?? "",
    targetAmount: v.targetAmount ?? 0,
    targetDate: v.targetDate ?? "",
    includeMonthlyIncome: v.includeMonthlyIncome !== false,
    monthlySharePct: v.shareMode === "custom" ? (v.sharePct ?? 0) : undefined,
    expectedReturnPct: (v.expectedReturnPct ?? 0) > 0 ? v.expectedReturnPct : undefined,
  };
}

export type PlanShares = {
  /** Fraction of monthly net this plan gets now. */
  share: number;
  /** Explicit shares across plans add up to more than 100 %. */
  overAllocated: boolean;
  /** Other plans that include monthly income. */
  otherPlans: number;
  /** The even-split share this plan would get without an explicit %. */
  automatic: number;
};

const pct = (fraction: number) => formatPercent(fraction * 100, { maximumFractionDigits: 0 });

type PlanDetailsCardProps = {
  draft: GoalProfile;
  /** Opens directly in edit mode (new plans). */
  startEditing: boolean;
  incomeMonthly: number;
  householdMonthlyNet: number;
  shares: PlanShares;
  /** Live preview while editing (KPIs and chart update before saving). */
  onPreview: (values: Values) => void;
  onCancel: () => void;
  onSave: (values: Values) => Promise<void>;
};

export function PlanDetailsCard({ draft, startEditing, incomeMonthly, householdMonthlyNet, shares, onPreview, onCancel, onSave }: PlanDetailsCardProps) {
  const [editing, setEditing] = useState(startEditing);
  const includes = draft.includeMonthlyIncome !== false;

  return (
    <Section
      title="Plan details"
      description="Name, target, how much of your monthly savings goes here, and expected growth."
      actions={
        editing ? null : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil />
            Edit
          </Button>
        )
      }
    >
      {editing ? (
        <DetailsForm
          draft={draft}
          incomeMonthly={incomeMonthly}
          householdMonthlyNet={householdMonthlyNet}
          shares={shares}
          onPreview={onPreview}
          onCancel={() => {
            onCancel();
            setEditing(false);
          }}
          onSave={async (v) => {
            await onSave(v);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <DescriptionList
            items={[
              { label: "Name", value: draft.name.trim() || <span className="text-muted-foreground">Untitled plan</span> },
              { label: "Target amount", value: draft.targetAmount > 0 ? <Money value={draft.targetAmount} /> : "—" },
              { label: "Target date", value: draft.targetDate ? formatDate(draft.targetDate) : "—" },
              {
                label: "Monthly income",
                value: includes ? <StatusBadge tone="success" dot>Included</StatusBadge> : <StatusBadge dot>Excluded</StatusBadge>,
                hint: includes ? (
                  <>
                    Income <Money value={incomeMonthly} /> − spending → <Money value={householdMonthlyNet} signed tone="auto" /> / month
                  </>
                ) : (
                  "Only the starting balance counts toward this plan."
                ),
              },
              ...(includes
                ? [
                    {
                      label: "Share of monthly savings",
                      value: (
                        <span>
                          {pct(shares.share)} · <Money value={householdMonthlyNet * shares.share} signed tone="auto" /> / month
                        </span>
                      ),
                      hint:
                        draft.monthlySharePct === undefined
                          ? shares.otherPlans > 0
                            ? "Automatic: what plans with a set % leave, split evenly."
                            : "Automatic: the only plan using monthly savings."
                          : "Set by you.",
                    },
                  ]
                : []),
              {
                label: "Expected yearly return",
                value: (draft.expectedReturnPct ?? 0) > 0 ? formatPercent(draft.expectedReturnPct!) : "None",
                hint: (draft.expectedReturnPct ?? 0) > 0 ? "Compounded monthly on the plan balance." : "Money is assumed to sit as cash.",
              },
            ]}
          />
          {includes && shares.overAllocated ? (
            <Callout tone="warning" title="Plans claim more than 100 % of your savings" className="mt-3">
              The shares you set add up to more than 100 %, so each is scaled down to fit. Lower one of them to make the numbers exact.
            </Callout>
          ) : null}
        </>
      )}
    </Section>
  );
}

function DetailsForm({
  draft,
  incomeMonthly,
  householdMonthlyNet,
  shares,
  onPreview,
  onCancel,
  onSave,
}: Omit<PlanDetailsCardProps, "startEditing"> & { draft: GoalProfile }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: draft.name,
      targetAmount: draft.targetAmount,
      targetDate: draft.targetDate ?? "",
      includeMonthlyIncome: draft.includeMonthlyIncome !== false,
      shareMode: draft.monthlySharePct === undefined ? "auto" : "custom",
      sharePct: draft.monthlySharePct ?? Math.round(shares.automatic * 100),
      expectedReturnPct: draft.expectedReturnPct ?? 0,
    },
  });

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values: v }) => onPreview(toPlanValues(v)),
      }),
    [form, onPreview],
  );

  const includeIncome = useWatch({ control: form.control, name: "includeMonthlyIncome" });
  const shareMode = useWatch({ control: form.control, name: "shareMode" });

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((v) => onSave(toPlanValues(v)))}>
        <TextField control={form.control} name="name" label="Plan name" placeholder="e.g. House upgrade" autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField control={form.control} name="targetAmount" label="Target amount" />
          <DateField control={form.control} name="targetDate" label="Target date" placeholder="Pick a date" />
        </div>
        <SwitchField
          control={form.control}
          name="includeMonthlyIncome"
          label="Include monthly income"
          description={
            <>
              Adds your monthly net (<Money value={householdMonthlyNet} signed /> from <Money value={incomeMonthly} /> income) to the
              projection every month.
            </>
          }
        />
        {includeIncome ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SegmentedField
              control={form.control}
              name="shareMode"
              label="Share of monthly savings"
              options={[
                { value: "auto", label: "Split evenly" },
                { value: "custom", label: "Set %" },
              ]}
              description={
                shareMode === "auto"
                  ? `Now ${pct(shares.automatic)}: savings are shared evenly between plans without a set %.`
                  : "Your savings are never counted twice: plans share 100 %."
              }
            />
            {shareMode === "custom" ? (
              <PercentField control={form.control} name="sharePct" label="This plan's share" description={<>Of <Money value={householdMonthlyNet} signed /> per month.</>} />
            ) : null}
          </div>
        ) : null}
        <PercentField
          control={form.control}
          name="expectedReturnPct"
          label="Expected yearly return"
          description="Growth on the plan balance (e.g. 5 % for a savings deposit). Leave 0 for cash."
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Save plan
          </Button>
        </div>
      </form>
    </Form>
  );
}
