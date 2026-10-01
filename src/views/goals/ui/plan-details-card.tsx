"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { GoalProfile } from "@/entities/goal";
import { formatDate } from "@/shared/lib/format";
import { DescriptionList } from "@/shared/ui/description-list";
import { DateField, MoneyField, SwitchField, TextField } from "@/shared/ui/form";
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
});

type Values = z.infer<typeof schema>;

type PlanDetailsCardProps = {
  draft: GoalProfile;
  /** Opens directly in edit mode (new plans). */
  startEditing: boolean;
  incomeMonthly: number;
  householdMonthlyNet: number;
  /** Live preview while editing (KPIs and chart update before saving). */
  onPreview: (values: Values) => void;
  onCancel: () => void;
  onSave: (values: Values) => Promise<void>;
};

export function PlanDetailsCard({ draft, startEditing, incomeMonthly, householdMonthlyNet, onPreview, onCancel, onSave }: PlanDetailsCardProps) {
  const [editing, setEditing] = useState(startEditing);
  const includes = draft.includeMonthlyIncome !== false;

  return (
    <Section
      title="Plan details"
      description="Name, target and whether monthly income counts toward this plan."
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
          ]}
        />
      )}
    </Section>
  );
}

function DetailsForm({
  draft,
  incomeMonthly,
  householdMonthlyNet,
  onPreview,
  onCancel,
  onSave,
}: Omit<PlanDetailsCardProps, "startEditing"> & { draft: GoalProfile }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: draft.name,
      targetAmount: draft.targetAmount,
      targetDate: draft.targetDate ?? "",
      includeMonthlyIncome: draft.includeMonthlyIncome !== false,
    },
  });

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values: v }) =>
          onPreview({
            name: v.name ?? "",
            targetAmount: v.targetAmount ?? 0,
            targetDate: v.targetDate ?? "",
            includeMonthlyIncome: v.includeMonthlyIncome !== false,
          }),
      }),
    [form, onPreview],
  );

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSave)}>
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
