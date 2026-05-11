"use client";

import { useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import type { Debt } from "@/shared/storage";
import { Button, Card, MaterialIcon, MoneyInput, PercentInput } from "@/shared/ui";

import { DebtRow } from "./DebtRow";

type DebtsSectionProps = {
  debts: Debt[];
  onAdd: (debt: Debt) => void;
  onUpdate: (debt: Debt) => void;
  onDelete: (id: string) => void;
};

const emptyDebt = (): Debt => ({
  id: `debt-${Date.now()}`,
  name: "",
  balance: 0,
  ratePct: 0,
  rateKind: "Fixed",
  nextPayment: "",
});

export function DebtsSection({ debts, onAdd, onUpdate, onDelete }: DebtsSectionProps) {
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
    const paymentDayOfMonth =
      day != null && day >= 1 && day <= 31 ? Math.floor(day) : undefined;
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
    <Card variant="section" className="p-6">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-surface-container-high pb-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-headline-md font-headline-md tracking-tight text-primary">
            <MaterialIcon name="money_off" className="text-error" />
            Debts &amp; Liabilities
          </h3>
          <p className="mt-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Obligations Overview
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Add Debt
        </Button>
      </div>

      <div className="space-y-4">
        {debts.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant py-2">
            No debts recorded. Use &quot;Add Debt&quot; to track loans, credit cards, and other
            liabilities.
          </p>
        ) : (
          debts.map((debt, idx) => (
            <DebtRow
              key={debt.id}
              debt={debt}
              isLast={idx === debts.length - 1}
              actions={
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${debt.name}`}
                    onClick={() => openEdit(debt)}
                    className="text-on-surface-variant transition-colors hover:text-secondary"
                  >
                    <MaterialIcon name="edit" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${debt.name}`}
                    onClick={() => requestDelete(debt)}
                    className="text-on-surface-variant transition-colors hover:text-error"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </span>
              }
            />
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{mode === "create" ? "Add debt" : "Edit debt"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-1">
          <TextField
            autoFocus
            margin="dense"
            label="Debt name"
            placeholder="e.g. Mortgage, Credit card"
            fullWidth
            value={draft?.name ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
          />
          <MoneyInput
            margin="dense"
            label="Outstanding balance (₫)"
            value={draft?.balance ?? 0}
            min={0}
            onChange={(balance) => setDraft((d) => (d ? { ...d, balance } : d))}
          />
          <PercentInput
            margin="dense"
            label="Interest rate"
            value={draft?.ratePct ?? 0}
            min={0}
            max={100}
            decimalScale={3}
            onChange={(ratePct) => setDraft((d) => (d ? { ...d, ratePct } : d))}
          />
          <TextField
            select
            margin="dense"
            label="Rate type"
            fullWidth
            value={draft?.rateKind ?? "Fixed"}
            onChange={(e) =>
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      rateKind: e.target.value as Debt["rateKind"],
                    }
                  : d,
              )
            }
          >
            <MenuItem value="Fixed">Fixed</MenuItem>
            <MenuItem value="Variable">Variable</MenuItem>
          </TextField>
          <TextField
            select
            margin="dense"
            label="Monthly payment date"
            fullWidth
            value={
              draft?.paymentDayOfMonth != null &&
              draft.paymentDayOfMonth >= 1 &&
              draft.paymentDayOfMonth <= 31
                ? String(draft.paymentDayOfMonth)
                : ""
            }
            onChange={(e) => {
              const v = e.target.value;
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      paymentDayOfMonth:
                        v === "" ? undefined : Number.parseInt(v, 10),
                    }
                  : d,
              );
            }}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            helperText="Day of the month your payment is due (1–31)."
          >
            <MenuItem value="">
              <em>Not set</em>
            </MenuItem>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <MenuItem key={day} value={String(day)}>
                {day}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Payment note (optional)"
            placeholder="e.g. ₫12.500.000 expected"
            fullWidth
            value={draft?.nextPayment ?? ""}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, nextPayment: e.target.value } : d))
            }
            helperText="Extra reminder — amount, bank reference, etc."
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDialog}>Cancel</MuiButton>
          <MuiButton onClick={saveDialog} variant="contained">
            {mode === "create" ? "Add" : "Save"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete debt?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `Remove “${pendingDelete.name}” from your liabilities list?`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDeleteOpen(false)}>Cancel</MuiButton>
          <MuiButton onClick={confirmDelete} color="error" variant="contained">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
