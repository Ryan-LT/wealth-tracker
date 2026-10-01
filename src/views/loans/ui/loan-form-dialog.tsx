"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PersonalLoan } from "@/entities/personal-loan";
import { DateField, MoneyField, SegmentedField, SelectField, TextareaField, TextField } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";

const schema = z.object({
  direction: z.enum(["lent_out", "borrowed"]),
  person: z.string().trim().min(1, "Who is this with?").max(80),
  amount: z.number().min(0),
  date: z.string().optional(),
  status: z.enum(["open", "settled"]),
  note: z.string().max(300).optional(),
});

type Values = z.infer<typeof schema>;

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
  const form = useForm<Values>({
    resolver: zodResolver(schema),
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
          <DialogTitle>{mode === "create" ? "Add personal loan" : "Edit personal loan"}</DialogTitle>
          <DialogDescription>A private log only — never counted in net worth.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <SelectField
            control={form.control}
            name="direction"
            label="Direction"
            options={[
              { value: "lent_out", label: "Owed to you — you lent the money" },
              { value: "borrowed", label: "You owe — you borrowed the money" },
            ]}
          />
          <TextField control={form.control} name="person" label="Person" placeholder="e.g. Anh Minh, Mom" autoFocus={mode === "create"} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField control={form.control} name="amount" label="Amount" />
            <DateField control={form.control} name="date" label="Date" clearable placeholder="No date" />
          </div>
          <SegmentedField
            control={form.control}
            name="status"
            label="Status"
            options={[
              { value: "open", label: "Open" },
              { value: "settled", label: "Settled" },
            ]}
          />
          <TextareaField control={form.control} name="note" label="Note" placeholder="What it was for, expected return…" />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Add loan" : "Save changes"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
