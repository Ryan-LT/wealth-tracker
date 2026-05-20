"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalLoan, PersonalLoanDirection } from "@/entities/personal-loan";
import { MoneyInput } from "@/shared/ui";

type LoanDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  draft: PersonalLoan | null;
  onChange: (next: PersonalLoan) => void;
  onClose: () => void;
  onSave: () => void;
};

const schema = z.object({
  direction: z.enum(["lent_out", "borrowed"]),
  person: z.string().min(1, "Person is required"),
  amount: z.number().nonnegative(),
  date: z.string().optional(),
  status: z.enum(["open", "settled"]),
  note: z.string().optional(),
});

type LoanFormValues = z.infer<typeof schema>;

export function LoanDialog({ open, mode, draft, onChange, onClose, onSave }: LoanDialogProps) {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      direction: draft?.direction ?? "lent_out",
      person: draft?.person ?? "",
      amount: draft?.amount ?? 0,
      date: draft?.date ?? "",
      status: draft?.status ?? "open",
      note: draft?.note ?? "",
    },
  });

  useEffect(() => {
    if (open && draft) {
      form.reset({
        direction: draft.direction,
        person: draft.person,
        amount: draft.amount,
        date: draft.date ?? "",
        status: draft.status,
        note: draft.note ?? "",
      });
    }
  }, [open, draft, form]);

  function patch(partial: Partial<PersonalLoan>) {
    if (!draft) return;
    onChange({ ...draft, ...partial });
  }

  function onSubmit(values: LoanFormValues) {
    if (!draft) return;
    onChange({
      ...draft,
      direction: values.direction,
      person: values.person,
      amount: values.amount,
      date: values.date || undefined,
      status: values.status,
      note: values.note || undefined,
    });
    onSave();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add loan note" : "Edit loan note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      patch({ direction: v as PersonalLoanDirection });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lent_out">Owed to you (you lent it)</SelectItem>
                      <SelectItem value="borrowed">You owe (you borrowed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    “Owed to you” means you lent the money. “You owe” means you borrowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Anh Minh, Mom, John"
                      autoFocus
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        patch({ person: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₫)</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={(amount) => {
                        field.onChange(amount);
                        patch({ amount });
                      }}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value || ""}
                      onChange={(date) => {
                        field.onChange(date);
                        patch({ date: date || undefined });
                      }}
                    />
                  </FormControl>
                  <FormDescription>When the loan happened (optional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      patch({ status: v === "settled" ? "settled" : "open" });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What it was for, expected return, etc."
                      rows={2}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        patch({ note: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Add" : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
