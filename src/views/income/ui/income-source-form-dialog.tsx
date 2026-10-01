"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Coins, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AllocateSourcesDialog } from "@/features/allocate-sources";
import type { GoalProfile, GoalSeedLine, GoalStartingOption } from "@/entities/goal";
import { totalCapitalAmount, wrapIncomeSourceAsProfile, type IncomeSource } from "@/entities/income";
import { DayOfMonthField, MoneyField, SegmentedField, SelectField, TextField } from "@/shared/ui/form";
import { ICON_OPTIONS, RegistryIcon } from "@/shared/ui/icon-registry";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";
import { Label } from "@/shared/ui/kit/label";
import { Money } from "@/shared/ui/money";

const schema = z.object({
  kind: z.enum(["active", "passive"]),
  name: z.string().trim().min(1, "Name is required").max(80),
  details: z.string().max(160),
  icon: z.string(),
  monthly: z.number().min(0),
  paymentEntity: z.string().max(80).optional(),
  paymentDay: z.number().int().min(1).max(31).optional(),
});

type Values = z.infer<typeof schema>;

type IncomeSourceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  source: IncomeSource | null;
  /** Other income sources wrapped as plans (their capital caps this one). */
  peers: GoalProfile[];
  seedOptions: GoalStartingOption[];
  onSubmit: (source: IncomeSource) => void;
};

export function IncomeSourceFormDialog({ open, onOpenChange, source, ...rest }: IncomeSourceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        {source ? (
          <IncomeSourceForm
            key={source.id}
            source={source}
            onCancel={() => onOpenChange(false)}
            {...rest}
            onSubmit={(next) => {
              rest.onSubmit(next);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function IncomeSourceForm({
  mode,
  source,
  peers,
  seedOptions,
  onCancel,
  onSubmit,
}: Omit<IncomeSourceFormDialogProps, "open" | "onOpenChange" | "source"> & { source: IncomeSource; onCancel: () => void }) {
  const [capitalLines, setCapitalLines] = useState<GoalSeedLine[]>(source.capitalLines ?? []);
  const [capitalOpen, setCapitalOpen] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: source.kind,
      name: source.name,
      details: source.details,
      icon: source.icon || "work",
      monthly: source.monthly,
      paymentEntity: source.paymentEntity ?? "",
      paymentDay: source.paymentDay,
    },
  });

  const name = useWatch({ control: form.control, name: "name" });
  const iconOptions = useMemo(() => {
    const opts = ICON_OPTIONS.map((o) => ({
      value: o.value,
      label: (
        <span className="flex items-center gap-2">
          <o.icon className="size-4 text-muted-foreground" />
          {o.label}
        </span>
      ),
    }));
    // Keep an unknown stored key selectable so editing never silently changes it.
    if (source.icon && !ICON_OPTIONS.some((o) => o.value === source.icon)) {
      opts.push({
        value: source.icon,
        label: (
          <span className="flex items-center gap-2">
            <RegistryIcon name={source.icon} className="text-muted-foreground" />
            {source.icon}
          </span>
        ),
      });
    }
    return opts;
  }, [source.icon]);

  const capitalTotal = totalCapitalAmount(capitalLines);
  const capitalProfile = useMemo(
    () => wrapIncomeSourceAsProfile({ ...source, name: name || source.name, capitalLines }),
    [source, name, capitalLines],
  );

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((v) => onSubmit({ ...source, ...v, capitalLines }))}
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add income source" : "Edit income source"}</DialogTitle>
          <DialogDescription>Monthly income feeds the dashboard, goal projections and the year-end estimate.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <SegmentedField
            control={form.control}
            name="kind"
            label="Type"
            options={[
              { value: "active", label: "Active" },
              { value: "passive", label: "Passive" },
            ]}
          />
          <TextField control={form.control} name="name" label="Name" placeholder="e.g. Salary, rental income" autoFocus={mode === "create"} />
          <TextField control={form.control} name="details" label="Details" placeholder="Optional description" />
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField control={form.control} name="monthly" label="Monthly amount" />
            <SelectField control={form.control} name="icon" label="Icon" options={iconOptions} />
          </div>
          <div className="grid gap-1.5">
            <Label>Capital invested</Label>
            <Button type="button" variant="outline" className="justify-between font-normal" onClick={() => setCapitalOpen(true)}>
              <span className="flex min-w-0 items-center gap-2">
                <Coins className="text-muted-foreground" />
                {capitalTotal > 0 ? (
                  <span className="truncate">
                    <Money value={capitalTotal} /> from {capitalLines.length} {capitalLines.length === 1 ? "source" : "sources"}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Link the assets that earn this income</span>
                )}
              </span>
              <Pencil className="text-muted-foreground" />
            </Button>
            <p className="text-xs text-muted-foreground">Mainly for passive income (deposits, bonds, rentals). Tracked separately from goal plans.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="paymentEntity" label="Paid by" placeholder="Optional" />
            <DayOfMonthField control={form.control} name="paymentDay" label="Payment day" />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Add source" : "Save changes"}</Button>
        </DialogFooter>
      </form>

      <AllocateSourcesDialog
        open={capitalOpen}
        onOpenChange={setCapitalOpen}
        title="Capital invested"
        description="Which assets produce this income? Amounts are capped by what other income sources already claim."
        profile={capitalProfile}
        savedPlans={peers}
        seedOptions={seedOptions}
        applyLabel="Use these sources"
        subject="income source"
        onApply={(lines) => setCapitalLines(lines)}
      />
    </Form>
  );
}
