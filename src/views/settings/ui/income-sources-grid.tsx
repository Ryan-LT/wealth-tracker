"use client";

import { useState } from "react";

import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import type { IncomeSource, IncomeSourceKind } from "@/shared/storage";
import { Button, MaterialIcon, MoneyInput } from "@/shared/ui";

import { IncomeSourceCard } from "./income-source-card";

function newIncomeSourceDraft(): IncomeSource {
  return {
    id: `income-${Date.now()}`,
    kind: "active",
    name: "",
    details: "",
    icon: "work",
    monthly: 0,
  };
}

type IncomeSourcesGridProps = {
  sources: IncomeSource[];
  onCreate: (source: IncomeSource) => void;
  onUpdate: (source: IncomeSource) => void;
  onDelete: (id: string) => void;
};

export function IncomeSourcesGrid({
  sources,
  onCreate,
  onUpdate,
  onDelete,
}: IncomeSourcesGridProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [draft, setDraft] = useState<IncomeSource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IncomeSource | null>(null);

  function openCreate() {
    setIsCreate(true);
    setDraft(newIncomeSourceDraft());
    setFormOpen(true);
  }

  function openEdit(source: IncomeSource) {
    setIsCreate(false);
    setDraft({ ...source });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setDraft(null);
  }

  function saveForm() {
    if (!draft?.id || !draft.name.trim()) return;
    const normalized: IncomeSource = {
      ...draft,
      name: draft.name.trim(),
      details: draft.details.trim(),
      monthly: Number.isFinite(draft.monthly) ? Math.max(0, draft.monthly) : 0,
      paymentEntity:
        draft.paymentEntity?.trim() === "" ? undefined : draft.paymentEntity?.trim(),
      paymentDay:
        draft.paymentDay !== undefined &&
        draft.paymentDay !== null &&
        draft.paymentDay >= 1 &&
        draft.paymentDay <= 31
          ? draft.paymentDay
          : undefined,
    };
    if (isCreate) {
      onCreate(normalized);
    } else {
      onUpdate(normalized);
    }
    closeForm();
  }

  function requestDelete(source: IncomeSource) {
    setPendingDelete(source);
    setDeleteOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
    }
    closeDeleteDialog();
  }

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="receipt_long" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Income Sources</h2>
        </div>
        <Button variant="secondary" onClick={openCreate}>
          Add Source
        </Button>
      </div>
      <div className="p-stack-md">
        {sources.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant py-4 text-center">
            No income sources yet. Click &quot;Add Source&quot; to create one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {sources.map((source) => (
              <IncomeSourceCard
                key={source.id}
                source={source}
                onEdit={() => openEdit(source)}
                onDelete={() => requestDelete(source)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{isCreate ? "Add income source" : "Edit income source"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-1">
          <FormControl fullWidth margin="dense">
            <InputLabel id="income-kind-label">Type</InputLabel>
            <Select
              labelId="income-kind-label"
              label="Type"
              value={draft?.kind ?? "active"}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, kind: e.target.value as IncomeSourceKind } : d,
                )
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="passive">Passive</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            required
            fullWidth
            value={draft?.name ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Details"
            fullWidth
            value={draft?.details ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, details: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Icon name"
            fullWidth
            helperText="Snake_case key matching materialIconRegistry (e.g. work, apartment, savings)."
            value={draft?.icon ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
          />
          <MoneyInput
            margin="dense"
            label="Monthly amount (₫)"
            value={draft?.monthly ?? 0}
            min={0}
            onChange={(v) =>
              setDraft((d) => (d ? { ...d, monthly: Math.max(0, v) } : d))
            }
          />
          <TextField
            margin="dense"
            label="Payment entity (optional)"
            fullWidth
            value={draft?.paymentEntity ?? ""}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, paymentEntity: e.target.value } : d))
            }
          />
          <TextField
            margin="dense"
            label="Payment day of month (optional)"
            type="number"
            fullWidth
            slotProps={{ htmlInput: { min: 1, max: 31, step: 1 } }}
            value={draft?.paymentDay ?? ""}
            onChange={(e) => {
              const raw = e.target.value === "" ? undefined : Number(e.target.value);
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      paymentDay:
                        raw === undefined || !Number.isFinite(raw)
                          ? undefined
                          : Math.min(31, Math.max(1, Math.round(raw))),
                    }
                  : d,
              );
            }}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeForm}>Cancel</MuiButton>
          <MuiButton
            onClick={saveForm}
            variant="contained"
            disabled={!draft?.name.trim()}
          >
            {isCreate ? "Add" : "Save"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete income source?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `Remove “${pendingDelete.name}” from your income sources? This cannot be undone.`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDeleteDialog}>Cancel</MuiButton>
          <MuiButton onClick={confirmDelete} color="error" variant="contained">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </section>
  );
}
