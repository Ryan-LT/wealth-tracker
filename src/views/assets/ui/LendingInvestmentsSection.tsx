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

import { formatVnd } from "@/shared/lib";
import type { Investment } from "@/shared/storage";
import { Button, Card, MoneyInput, SectionHeader } from "@/shared/ui";

import { InvestmentCard } from "./InvestmentCard";

type LendingInvestmentsSectionProps = {
  investments: Investment[];
  onChange: (next: Investment[]) => void;
};

function newInvestment(): Investment {
  return {
    id: `inv-${Date.now()}`,
    name: "",
    icon: "savings",
    details: "",
    badge: { kind: "growth", label: "Growth" },
    rateLabel: "Yield",
    rateValue: "0%",
    rateIncomeNote: "",
    valueLabel: "Principal",
    value: 0,
  };
}

export function LendingInvestmentsSection({
  investments,
  onChange,
}: LendingInvestmentsSectionProps) {
  const total = investments.reduce((sum, i) => sum + i.value, 0);

  type DialogMode = "idle" | "create" | "edit";
  const [dialogMode, setDialogMode] = useState<DialogMode>("idle");
  const [draft, setDraft] = useState<Investment | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Investment | null>(null);

  function openCreate() {
    setDraft(newInvestment());
    setDialogMode("create");
  }

  function openEdit(inv: Investment) {
    setDraft({ ...inv });
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode("idle");
    setDraft(null);
  }

  function saveDialog() {
    if (!draft?.id) return;
    const next: Investment = {
      ...draft,
      name: draft.name.trim() || "Investment",
      icon: draft.icon.trim() || "savings",
      details: draft.details.trim(),
      badge: {
        kind: draft.badge.kind,
        label: draft.badge.label.trim() || "—",
      },
      rateLabel: draft.rateLabel.trim() || "Rate",
      rateValue: draft.rateValue.trim() || "—",
      rateIncomeNote: draft.rateIncomeNote.trim(),
      valueLabel: draft.valueLabel.trim() || "Value",
      value: Math.max(0, draft.value),
    };

    if (dialogMode === "create") {
      onChange([...investments, next]);
    } else if (dialogMode === "edit") {
      onChange(investments.map((i) => (i.id === next.id ? next : i)));
    }
    closeDialog();
  }

  function requestDelete(inv: Investment) {
    setPendingDelete(inv);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onChange(investments.filter((i) => i.id !== pendingDelete.id));
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  const dialogOpen = dialogMode !== "idle";

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Lending & Investments"
        subtitle="Yield-Generating Assets"
        end={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-end sm:gap-4">
            <Button type="button" onClick={openCreate}>
              Add holding
            </Button>
            <div className="text-right">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Total Value
              </p>
              <p className="font-data-tabular text-[24px] font-semibold leading-[32px] text-primary">
                {formatVnd(total)}
              </p>
            </div>
          </div>
        }
      />

      {investments.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant py-2">
          No lending or investment positions yet. Use &quot;Add holding&quot; for bonds, funds,
          peer lending, or other yield assets — amounts roll into total assets and net worth.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onEdit={() => openEdit(investment)}
              onDelete={() => requestDelete(investment)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Add holding" : "Edit holding"}</DialogTitle>
        <DialogContent className="flex max-h-[min(85vh,560px)] flex-col gap-3 overflow-y-auto pt-1">
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={draft?.name ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Icon (Material Symbol)"
            placeholder="savings"
            fullWidth
            value={draft?.icon ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Details"
            multiline
            minRows={2}
            fullWidth
            value={draft?.details ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, details: e.target.value } : d))}
          />
          <TextField
            select
            margin="dense"
            label="Badge type"
            fullWidth
            value={draft?.badge.kind ?? "growth"}
            onChange={(e) =>
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      badge: {
                        ...d.badge,
                        kind: e.target.value as Investment["badge"]["kind"],
                      },
                    }
                  : d,
              )
            }
          >
            <MenuItem value="growth">Growth</MenuItem>
            <MenuItem value="active">Active</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Badge label"
            fullWidth
            value={draft?.badge.label ?? ""}
            onChange={(e) =>
              setDraft((d) =>
                d ? { ...d, badge: { ...d.badge, label: e.target.value } } : d,
              )
            }
          />
          <TextField
            margin="dense"
            label="Rate row label"
            placeholder="Yield"
            fullWidth
            value={draft?.rateLabel ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, rateLabel: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Rate value"
            placeholder="8.5%"
            fullWidth
            value={draft?.rateValue ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, rateValue: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Rate income note"
            placeholder="(+₫12M projected)"
            fullWidth
            value={draft?.rateIncomeNote ?? ""}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, rateIncomeNote: e.target.value } : d))
            }
          />
          <TextField
            margin="dense"
            label="Value column label"
            placeholder="Principal"
            fullWidth
            value={draft?.valueLabel ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, valueLabel: e.target.value } : d))}
          />
          <MoneyInput
            margin="dense"
            label="Position value (₫)"
            value={draft?.value ?? 0}
            min={0}
            onChange={(value) => setDraft((d) => (d ? { ...d, value } : d))}
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
        <DialogTitle>Delete holding?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete ? `Remove “${pendingDelete.name}” from investments?` : null}
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
