"use client";

import { useState } from "react";

import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import { formatVnd } from "@/shared/lib";
import type { CashAccount } from "@/shared/storage";
import { Button, Card, MaterialIcon, MoneyInput, SectionHeader } from "@/shared/ui";

import { CashRow } from "./CashRow";

type CashEquivalentsSectionProps = {
  accounts: CashAccount[];
  onChange: (next: CashAccount[]) => void;
};

function newCashAccount(): CashAccount {
  return {
    id: `cash-${Date.now()}`,
    category: "Cash",
    details: "",
    icon: "account_balance_wallet",
    yieldPct: 0,
    balance: 0,
  };
}

export function CashEquivalentsSection({ accounts, onChange }: CashEquivalentsSectionProps) {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  type DialogMode = "idle" | "create" | "edit";
  const [dialogMode, setDialogMode] = useState<DialogMode>("idle");
  const [draft, setDraft] = useState<CashAccount | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CashAccount | null>(null);

  const dialogOpen = dialogMode !== "idle";

  function openCreate() {
    setDraft(newCashAccount());
    setDialogMode("create");
  }

  function openEdit(account: CashAccount) {
    setDraft({ ...account });
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode("idle");
    setDraft(null);
  }

  function saveDialog() {
    if (!draft?.id) return;
    const yieldIncome =
      draft.yieldIncome != null && draft.yieldIncome > 0 ? draft.yieldIncome : undefined;
    const next: CashAccount = {
      ...draft,
      category: draft.category.trim() || "Cash",
      details: draft.details.trim(),
      icon: draft.icon.trim() || "account_balance",
      yieldPct: Math.max(0, draft.yieldPct),
      yieldIncome,
      balance: Math.max(0, draft.balance),
    };

    if (dialogMode === "create") {
      onChange([...accounts, next]);
    } else if (dialogMode === "edit") {
      onChange(accounts.map((a) => (a.id === next.id ? next : a)));
    }
    closeDialog();
  }

  function requestDelete(account: CashAccount) {
    setPendingDelete(account);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onChange(accounts.filter((a) => a.id !== pendingDelete.id));
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Cash & Equivalents"
        subtitle="Liquidity Overview"
        end={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-end sm:gap-4">
            <Button type="button" onClick={openCreate}>
              Add account
            </Button>
            <div className="text-right">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Total Liquidity
              </p>
              <p className="font-data-tabular text-[24px] font-semibold leading-[32px] text-primary">
                {formatVnd(total)}
              </p>
            </div>
          </div>
        }
      />

      {accounts.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant py-2">
          No cash accounts yet. Use &quot;Add account&quot; to track savings, money market funds, and
          other liquid holdings (stored with your asset data).
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Category
                </th>
                <th className="py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Details
                </th>
                <th className="py-3 text-right font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Yield/Income
                </th>
                <th className="py-3 text-right font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Balance (VND)
                </th>
                <th className="py-3 text-right font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md">
              {accounts.map((account, idx) => (
                <CashRow
                  key={account.id}
                  account={account}
                  isLast={idx === accounts.length - 1}
                  actions={
                    <span className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${account.category}`}
                        onClick={() => openEdit(account)}
                        className="text-on-surface-variant transition-colors hover:text-secondary"
                      >
                        <MaterialIcon name="edit" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${account.category}`}
                        onClick={() => requestDelete(account)}
                        className="text-on-surface-variant transition-colors hover:text-error"
                      >
                        <MaterialIcon name="delete" />
                      </button>
                    </span>
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Add cash account" : "Edit cash account"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-1">
          <TextField
            autoFocus
            margin="dense"
            label="Category"
            placeholder="e.g. Cash, Money market"
            fullWidth
            value={draft?.category ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, category: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Details"
            placeholder="Bank or product name"
            fullWidth
            value={draft?.details ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, details: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Icon (Material Symbol)"
            placeholder="account_balance_wallet"
            fullWidth
            value={draft?.icon ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
            helperText="Icon name from Material Symbols."
          />
          <TextField
            margin="dense"
            label="Annual yield (%)"
            type="number"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            value={draft?.yieldPct ?? 0}
            onChange={(e) =>
              setDraft((d) =>
                d ? { ...d, yieldPct: Number.parseFloat(e.target.value) || 0 } : d,
              )
            }
          />
          <MoneyInput
            margin="dense"
            label="Est. annual income from yield (₫)"
            value={draft?.yieldIncome ?? 0}
            min={0}
            onChange={(yieldIncome) => setDraft((d) => (d ? { ...d, yieldIncome } : d))}
          />
          <MoneyInput
            margin="dense"
            label="Balance (₫)"
            value={draft?.balance ?? 0}
            min={0}
            onChange={(balance) => setDraft((d) => (d ? { ...d, balance } : d))}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDialog}>Cancel</MuiButton>
          <MuiButton onClick={saveDialog} variant="contained">
            {dialogMode === "create" ? "Add" : "Save"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete cash account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `Remove “${pendingDelete.category}” (${pendingDelete.details || "no details"}) from liquidity?`
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
