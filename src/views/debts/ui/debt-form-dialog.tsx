"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Debt } from "@/entities/debt";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";
import { DayOfMonthField, MoneyField, PercentField, SegmentedField, TextField } from "@/shared/ui/form";

const schema = z.object({
  name: z.string().trim().min(1, "Give this debt a name").max(80),
  balance: z.number().min(0),
  ratePct: z.number().min(0).max(100),
  rateKind: z.enum(["Fixed", "Variable"]),
  paymentDayOfMonth: z.number().int().min(1).max(31).optional(),
  nextPayment: z.string().max(200),
  monthlyPayment: z.number().min(0),
});

type Values = z.infer<typeof schema>;

type DebtFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  debt: Debt | null;
  onSubmit: (debt: Debt) => void;
};

export function DebtFormDialog({ open, onOpenChange, mode, debt, onSubmit }: DebtFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        {debt ? (
          <DebtForm
            key={debt.id}
            mode={mode}
            debt={debt}
            onCancel={() => onOpenChange(false)}
            onSubmit={(next) => {
              onSubmit(next);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DebtForm({
  mode,
  debt,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  debt: Debt;
  onCancel: () => void;
  onSubmit: (debt: Debt) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: debt.name,
      balance: debt.balance,
      ratePct: debt.ratePct,
      rateKind: debt.rateKind,
      paymentDayOfMonth: debt.paymentDayOfMonth,
      nextPayment: debt.nextPayment,
      monthlyPayment: debt.monthlyPayment ?? 0,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((values) => onSubmit({ ...debt, ...values }))}
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add debt" : "Edit debt"}</DialogTitle>
          <DialogDescription>Outstanding balances count against your net worth.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <TextField control={form.control} name="name" label="Name" placeholder="e.g. Mortgage, credit card" autoFocus={mode === "create"} />
          <MoneyField control={form.control} name="balance" label="Outstanding balance" />
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField control={form.control} name="ratePct" label="Interest rate" description="Annual, 0–100%." />
            <SegmentedField
              control={form.control}
              name="rateKind"
              label="Rate type"
              options={[
                { value: "Fixed", label: "Fixed" },
                { value: "Variable", label: "Variable" },
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              control={form.control}
              name="monthlyPayment"
              label="Monthly payment"
              description="What you repay each month. Used for the payoff date."
            />
            <DayOfMonthField control={form.control} name="paymentDayOfMonth" label="Monthly payment day" description="Day of the month the payment is due." />
          </div>
          <TextField control={form.control} name="nextPayment" label="Payment note" placeholder="e.g. 12.500.000 ₫, auto-debit from VCB" description="Optional reminder — amount, bank, reference." />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Add debt" : "Save changes"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
