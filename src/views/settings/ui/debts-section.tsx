"use client";

import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Debt } from "@/entities/debt";
import { MoneyInput, PercentInput } from "@/shared/ui";

import { DebtRow } from "./debt-row";

type DebtsSectionProps = {
  debts: Debt[];
  onAdd: (debt: Debt) => void;
  onUpdate: (debt: Debt) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

function DebtRowSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <div className={isLast ? "pb-4" : "pb-4 border-b border-border"}>
      <div className="mb-1 flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-40" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <div className="size-8" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyDebt = (): Debt => ({
  id: `debt-${Date.now()}`,
  name: "",
  balance: 0,
  ratePct: 0,
  rateKind: "Fixed",
  nextPayment: "",
});

export function DebtsSection({ debts, onAdd, onUpdate, onDelete, loading = false }: DebtsSectionProps) {
  type Mode = "idle" | "create" | "edit";
  const [mode, setMode] = useState<Mode>("idle");
  const [draft, setDraft] = useState<Debt | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Debt | null>(null);

  const dialogOpen = mode !== "idle";

  function openCreate() {
    setDraft(emptyDebt());
    setMode("create");
  }

  function openEdit(debt: Debt) {
    setDraft({ ...debt });
    setMode("edit");
  }

  function closeDialog() {
    setMode("idle");
    setDraft(null);
  }

  function saveDialog() {
    if (!draft?.id) return;
    const day = draft.paymentDayOfMonth;
    const paymentDayOfMonth = day != null && day >= 1 && day <= 31 ? Math.floor(day) : undefined;
    const next: Debt = {
      ...draft,
      id: draft.id,
      name: draft.name.trim() || "Debt",
      balance: Math.max(0, draft.balance),
      ratePct: Math.min(100, Math.max(0, draft.ratePct)),
      rateKind: draft.rateKind,
      paymentDayOfMonth,
      nextPayment: draft.nextPayment.trim(),
    };
    if (mode === "create") {
      onAdd(next);
    } else if (mode === "edit") {
      onUpdate(next);
    }
    closeDialog();
  }

  function requestDelete(debt: Debt) {
    setPendingDelete(debt);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  return (
    <Card variant="outflow">
      <CardHeader className="flex flex-row items-end justify-between gap-4 space-y-0 border-b">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="size-4 text-destructive" />
            Debts & Liabilities
          </CardTitle>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Obligations overview
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          Add Debt
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <DebtRowSkeleton key={idx} isLast={idx === 2} />
            ))
          ) : debts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No debts recorded. Use &quot;Add Debt&quot; to track loans, credit cards, etc.
            </p>
          ) : (
            debts.map((debt, idx) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                isLast={idx === debts.length - 1}
                actions={
                  <span className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Edit ${debt.name}`}
                      onClick={() => openEdit(debt)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${debt.name}`}
                      onClick={() => requestDelete(debt)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </span>
                }
              />
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add debt" : "Edit debt"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="debt-name">Debt name</Label>
              <Input
                id="debt-name"
                autoFocus
                placeholder="e.g. Mortgage, Credit card"
                value={draft?.name ?? ""}
                onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
              />
            </div>
            <MoneyInput
              label="Outstanding balance (₫)"
              value={draft?.balance ?? 0}
              min={0}
              onChange={(balance) => setDraft((d) => (d ? { ...d, balance } : d))}
            />
            <PercentInput
              label="Interest rate"
              value={draft?.ratePct ?? 0}
              min={0}
              max={100}
              decimalScale={3}
              onChange={(ratePct) => setDraft((d) => (d ? { ...d, ratePct } : d))}
            />
            <div className="flex flex-col gap-1.5">
              <Label>Rate type</Label>
              <Select
                value={draft?.rateKind ?? "Fixed"}
                onValueChange={(v) =>
                  setDraft((d) => (d ? { ...d, rateKind: v as Debt["rateKind"] } : d))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Monthly payment date</Label>
              <Select
                value={
                  draft?.paymentDayOfMonth != null &&
                  draft.paymentDayOfMonth >= 1 &&
                  draft.paymentDayOfMonth <= 31
                    ? String(draft.paymentDayOfMonth)
                    : "_unset"
                }
                onValueChange={(v) =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          paymentDayOfMonth:
                            v === "_unset" ? undefined : Number.parseInt(v, 10),
                        }
                      : d,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="_unset">Not set</SelectItem>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Day of the month (1–31).</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="debt-note">Payment note (optional)</Label>
              <Input
                id="debt-note"
                placeholder="e.g. ₫12.500.000 expected"
                value={draft?.nextPayment ?? ""}
                onChange={(e) => setDraft((d) => (d ? { ...d, nextPayment: e.target.value } : d))}
              />
              <p className="text-xs text-muted-foreground">Extra reminder — amount, bank, etc.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={saveDialog}>{mode === "create" ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete debt?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `Remove "${pendingDelete.name}" from your liabilities list?`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
