"use client";

import { useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import { isDefaultAssetCategory } from "@/shared/config";
import { formatThousands } from "@/shared/lib";
import type { SettingsAsset } from "@/shared/storage";
import { Button, MaterialIcon, MoneyInput } from "@/shared/ui";

type AssetManagementTableProps = {
  assets: SettingsAsset[];
  /** Category combobox options (defaults + saved customs + in-use labels). */
  categoryOptions: string[];
  /** Persist a user-typed category so it appears in the list next time. */
  onRegisterCustomCategory?: (category: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (asset: SettingsAsset) => void;
  onAdd: (asset: SettingsAsset) => void;
};

export function AssetManagementTable({
  assets,
  categoryOptions,
  onRegisterCustomCategory,
  onDelete,
  onUpdate,
  onAdd,
}: AssetManagementTableProps) {
  type AssetDialogMode = "idle" | "edit" | "create";
  const [assetDialogMode, setAssetDialogMode] = useState<AssetDialogMode>("idle");
  const [assetDraft, setAssetDraft] = useState<SettingsAsset | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SettingsAsset | null>(null);

  function openEdit(asset: SettingsAsset) {
    setAssetDraft({ ...asset });
    setAssetDialogMode("edit");
  }

  function openCreate() {
    setAssetDraft({
      id: `asset-${Date.now()}`,
      name: "",
      category: "Cash",
      currentValue: 0,
    });
    setAssetDialogMode("create");
  }

  function closeAssetDialog() {
    setAssetDialogMode("idle");
    setAssetDraft(null);
  }

  function saveAssetDialog() {
    if (!assetDraft?.id) return;
    const trimmedCat = assetDraft.category.trim() || "Cash";
    const next: SettingsAsset = {
      ...assetDraft,
      name: assetDraft.name.trim(),
      category: trimmedCat,
    };
    if (trimmedCat && !isDefaultAssetCategory(trimmedCat)) {
      onRegisterCustomCategory?.(trimmedCat);
    }
    if (assetDialogMode === "edit") {
      onUpdate(next);
    } else if (assetDialogMode === "create") {
      onAdd(next);
    }
    closeAssetDialog();
  }

  const assetDialogOpen = assetDialogMode !== "idle";

  function requestDelete(asset: SettingsAsset) {
    setPendingDelete(asset);
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
          <MaterialIcon name="account_balance" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Asset Management</h2>
        </div>
        <Button onClick={openCreate}>Add Asset</Button>
      </div>
      <div className="p-stack-md overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant">
                Asset Name
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant">
                Category
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant text-right">
                Current Value (₫)
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr
                key={asset.id}
                className={
                  idx === assets.length - 1
                    ? "hover:bg-surface-container-low transition-colors"
                    : "border-b border-surface-variant hover:bg-surface-container-low transition-colors"
                }
              >
                <td className="py-4 font-body-md text-body-md text-primary">{asset.name}</td>
                <td className="py-4 font-body-md text-body-md text-on-surface-variant">
                  {asset.category}
                </td>
                <td className="py-4 font-data-tabular text-data-tabular text-primary text-right">
                  {formatThousands(asset.currentValue)}
                </td>
                <td className="py-4 text-right">
                  <button
                    type="button"
                    aria-label={`Edit ${asset.name}`}
                    onClick={() => openEdit(asset)}
                    className="text-on-surface-variant hover:text-secondary transition-colors mr-2"
                  >
                    <MaterialIcon name="edit" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${asset.name}`}
                    onClick={() => requestDelete(asset)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={assetDialogOpen} onClose={closeAssetDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {assetDialogMode === "create" ? "Add asset" : "Edit asset"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-1">
          <TextField
            autoFocus
            margin="dense"
            label="Asset name"
            fullWidth
            value={assetDraft?.name ?? ""}
            onChange={(e) =>
              setAssetDraft((d) => (d ? { ...d, name: e.target.value } : d))
            }
          />
          <Autocomplete
            freeSolo
            options={categoryOptions}
            value={assetDraft?.category ?? ""}
            onChange={(_, newValue) => {
              const v = typeof newValue === "string" ? newValue : "";
              setAssetDraft((d) => (d ? { ...d, category: v } : d));
            }}
            onInputChange={(_, inputValue, reason) => {
              if (reason === "input" || reason === "clear") {
                setAssetDraft((d) => (d ? { ...d, category: inputValue } : d));
              }
            }}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Category" fullWidth />
            )}
          />
          <MoneyInput
            margin="dense"
            label="Current value (₫)"
            value={assetDraft?.currentValue ?? 0}
            min={0}
            onChange={(v) =>
              setAssetDraft((d) => (d ? { ...d, currentValue: Math.max(0, v) } : d))
            }
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeAssetDialog}>Cancel</MuiButton>
          <MuiButton onClick={saveAssetDialog} variant="contained">
            {assetDialogMode === "create" ? "Add" : "Save"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete asset?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `This will remove “${pendingDelete.name}” from your list. This cannot be undone.`
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
