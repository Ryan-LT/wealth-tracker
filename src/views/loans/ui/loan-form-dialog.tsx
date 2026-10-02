"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PersonalLoan } from "@/entities/personal-loan";
import { useI18n, type Messages } from "@/shared/i18n";
import { DateField, MoneyField, SegmentedField, SelectField, TextareaField, TextField } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";

const makeSchema = (t: Messages) =>
  z.object({
    direction: z.enum(["lent_out", "borrowed"]),
    person: z.string().trim().min(1, t.loans.form.personRequired).max(80),
    amount: z.number().min(0),
    date: z.string().optional(),
    status: z.enum(["open", "settled"]),
    note: z.string().max(300).optional(),
  });

type Values = z.infer<ReturnType<typeof makeSchema>>;

type LoanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  loan: PersonalLoan | null;
  onSubmit: (loan: PersonalLoan) => void;
};

export function LoanFormDialog({ open, onOpenChange, mode, loan, onSubmit }: LoanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        {loan ? (
          <LoanForm
            key={loan.id}
            mode={mode}
            loan={loan}
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

function LoanForm({
  mode,
  loan,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  loan: PersonalLoan;
  onCancel: () => void;
  onSubmit: (loan: PersonalLoan) => void;
}) {
  const { t } = useI18n();
  const form = useForm<Values>({
    resolver: zodResolver(makeSchema(t)),
    defaultValues: {
      direction: loan.direction,
      person: loan.person,
      amount: loan.amount,
      date: loan.date ?? "",
      status: loan.status,
      note: loan.note ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((v) =>
          onSubmit({ ...loan, ...v, date: v.date || undefined, note: v.note || undefined }),
        )}
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? t.loans.form.addTitle : t.loans.form.editTitle}</DialogTitle>
          <DialogDescription>{t.loans.form.description}</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <SelectField
            control={form.control}
            name="direction"
            label={t.loans.form.direction}
            options={[
              { value: "lent_out", label: t.loans.form.directionLent },
              { value: "borrowed", label: t.loans.form.directionBorrowed },
            ]}
          />
          <TextField control={form.control} name="person" label={t.loans.form.person} placeholder={t.loans.form.personPlaceholder} autoFocus={mode === "create"} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField control={form.control} name="amount" label={t.loans.form.amount} />
            <DateField control={form.control} name="date" label={t.loans.form.date} clearable placeholder={t.loans.form.datePlaceholder} />
          </div>
          <SegmentedField
            control={form.control}
            name="status"
            label={t.loans.form.status}
            options={[
              { value: "open", label: t.loans.open },
              { value: "settled", label: t.loans.settled },
            ]}
          />
          <TextareaField control={form.control} name="note" label={t.loans.form.note} placeholder={t.loans.form.notePlaceholder} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit">{mode === "create" ? t.loans.form.submitAdd : t.common.saveChanges}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
