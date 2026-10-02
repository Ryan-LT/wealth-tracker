"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Debt } from "@/entities/debt";
import { useI18n, type Messages } from "@/shared/i18n";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";
import { DayOfMonthField, MoneyField, PercentField, SegmentedField, TextField } from "@/shared/ui/form";

const makeSchema = (t: Messages) =>
  z.object({
    name: z.string().trim().min(1, t.debts.form.nameRequired).max(80),
    balance: z.number().min(0),
    ratePct: z.number().min(0).max(100),
    rateKind: z.enum(["Fixed", "Variable"]),
    paymentDayOfMonth: z.number().int().min(1).max(31).optional(),
    nextPayment: z.string().max(200),
    monthlyPayment: z.number().min(0),
  });

type Values = z.infer<ReturnType<typeof makeSchema>>;

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
  const { t } = useI18n();
  const form = useForm<Values>({
    resolver: zodResolver(makeSchema(t)),
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
          <DialogTitle>{mode === "create" ? t.debts.form.addTitle : t.debts.form.editTitle}</DialogTitle>
          <DialogDescription>{t.debts.form.description}</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <TextField control={form.control} name="name" label={t.debts.form.name} placeholder={t.debts.form.namePlaceholder} autoFocus={mode === "create"} />
          <MoneyField control={form.control} name="balance" label={t.debts.form.balance} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField control={form.control} name="ratePct" label={t.debts.form.rate} description={t.debts.form.rateHint} />
            <SegmentedField
              control={form.control}
              name="rateKind"
              label={t.debts.form.rateKind}
              options={[
                { value: "Fixed", label: t.debts.rateKind.Fixed },
                { value: "Variable", label: t.debts.rateKind.Variable },
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              control={form.control}
              name="monthlyPayment"
              label={t.debts.form.monthlyPayment}
              description={t.debts.form.monthlyPaymentHint}
            />
            <DayOfMonthField control={form.control} name="paymentDayOfMonth" label={t.debts.form.paymentDay} description={t.debts.form.paymentDayHint} />
          </div>
          <TextField control={form.control} name="nextPayment" label={t.debts.form.note} placeholder={t.debts.form.notePlaceholder} description={t.debts.form.noteHint} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit">{mode === "create" ? t.debts.form.submitAdd : t.common.saveChanges}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
