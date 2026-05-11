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
import type { RealEstateProperty } from "@/shared/storage";
import { Button, Card, MoneyInput, SectionHeader } from "@/shared/ui";

import { PropertyRow } from "./PropertyRow";

type RealEstateSectionProps = {
  properties: RealEstateProperty[];
  onChange: (next: RealEstateProperty[]) => void;
};

function newProperty(): RealEstateProperty {
  return {
    id: `re-${Date.now()}`,
    name: "",
    address: "",
    icon: "home",
    estValue: 0,
    badge: { kind: "growth", label: "Est. appreciation" },
  };
}

export function RealEstateSection({ properties, onChange }: RealEstateSectionProps) {
  const total = properties.reduce((sum, p) => sum + p.estValue, 0);

  type DialogMode = "idle" | "create" | "edit";
  const [dialogMode, setDialogMode] = useState<DialogMode>("idle");
  const [draft, setDraft] = useState<RealEstateProperty | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RealEstateProperty | null>(null);

  function updateOne(updated: RealEstateProperty) {
    onChange(properties.map((p) => (p.id === updated.id ? updated : p)));
  }

  function openCreate() {
    setDraft(newProperty());
    setDialogMode("create");
  }

  function openEdit(p: RealEstateProperty) {
    setDraft({ ...p });
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode("idle");
    setDraft(null);
  }

  function saveDialog() {
    if (!draft?.id) return;
    const next: RealEstateProperty = {
      ...draft,
      name: draft.name.trim() || "Property",
      address: draft.address.trim(),
      icon: draft.icon.trim() || "home",
      estValue: Math.max(0, draft.estValue),
      badge: {
        kind: draft.badge.kind,
        label: draft.badge.label.trim() || "—",
      },
    };

    if (dialogMode === "create") {
      onChange([...properties, next]);
    } else if (dialogMode === "edit") {
      onChange(properties.map((p) => (p.id === next.id ? next : p)));
    }
    closeDialog();
  }

  function requestDelete(p: RealEstateProperty) {
    setPendingDelete(p);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onChange(properties.filter((p) => p.id !== pendingDelete.id));
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  const dialogOpen = dialogMode !== "idle";

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Real Estate"
        subtitle="Property Holdings & Values"
        end={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-end sm:gap-4">
            <Button type="button" onClick={openCreate}>
              Add property
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

      {properties.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant py-2">
          No properties yet. Use &quot;Add property&quot; to record homes, land, and other real
          estate — totals sync with your dashboard net worth.
        </p>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyRow
              key={property.id}
              property={property}
              onChange={updateOne}
              onEdit={() => openEdit(property)}
              onDelete={() => requestDelete(property)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Add property" : "Edit property"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-1">
          <TextField
            autoFocus
            margin="dense"
            label="Property name"
            fullWidth
            value={draft?.name ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={draft?.address ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, address: e.target.value } : d))}
          />
          <TextField
            margin="dense"
            label="Icon (Material Symbol)"
            placeholder="home"
            fullWidth
            value={draft?.icon ?? ""}
            onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
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
                        kind: e.target.value as RealEstateProperty["badge"]["kind"],
                      },
                    }
                  : d,
              )
            }
          >
            <MenuItem value="growth">Growth</MenuItem>
            <MenuItem value="passive-income">Passive income</MenuItem>
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
          <MoneyInput
            margin="dense"
            label="Estimated value (₫)"
            value={draft?.estValue ?? 0}
            min={0}
            onChange={(estValue) => setDraft((d) => (d ? { ...d, estValue } : d))}
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
        <DialogTitle>Delete property?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `Remove “${pendingDelete.name}” from your holdings?`
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
