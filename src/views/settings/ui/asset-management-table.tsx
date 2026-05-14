"use client";

import { useMemo, useState } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Autocomplete from "@mui/material/Autocomplete";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { assetCategoryBadgeClassNames, isDefaultAssetCategory } from "@/shared/config";
import { cn, formatThousands } from "@/shared/lib";
import {
  SETTINGS_ASSET_LIQUIDITY_DEFAULT,
  type SettingsAsset,
  type SettingsAssetLiquidity,
  resolveSettingsAssetLiquidity,
  settingsAssetLiquidityLabel,
} from "@/shared/storage";
import { Button, MaterialIcon, MoneyInput } from "@/shared/ui";

type AssetSortKey = "name" | "category" | "liquidity" | "value";
type AssetSortDir = "asc" | "desc";
type AssetSortState = { key: AssetSortKey; dir: AssetSortDir };

function nextSortState(prev: AssetSortState | null, key: AssetSortKey): AssetSortState | null {
  if (!prev || prev.key !== key) return { key, dir: "asc" };
  if (prev.dir === "asc") return { key, dir: "desc" };
  return null;
}

function liquidityRank(v: SettingsAsset["liquidity"]): number {
  return resolveSettingsAssetLiquidity(v) === "instant" ? 0 : 1;
}

function sortAssetsList(
  items: SettingsAsset[],
  key: AssetSortKey,
  dir: AssetSortDir,
): SettingsAsset[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "category":
        cmp = a.category.localeCompare(b.category, undefined, { sensitivity: "base" });
        break;
      case "liquidity":
        cmp = liquidityRank(a.liquidity) - liquidityRank(b.liquidity);
        break;
      case "value":
        cmp = a.currentValue - b.currentValue;
        break;
    }
    if (cmp !== 0) return mul * cmp;
    return a.id.localeCompare(b.id);
  });
}

type SortColumnHeaderProps = {
  label: string;
  sortKey: AssetSortKey;
  align?: "left" | "right";
  sort: AssetSortState | null;
  onToggleSort: (key: AssetSortKey) => void;
};

function SortColumnHeader({
  label,
  sortKey,
  align,
  sort: sortState,
  onToggleSort,
}: SortColumnHeaderProps) {
  const active = sortState?.key === sortKey;
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sortState.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(
        "border-b border-outline-variant pb-3 font-label-sm text-label-sm uppercase text-on-surface-variant",
        align === "right" && "text-right",
      )}
    >
      <button
        type="button"
        onClick={() => onToggleSort(sortKey)}
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded border-0 bg-transparent p-0 font-inherit uppercase tracking-wider transition-colors hover:text-primary",
          align === "right" && "w-full justify-end",
        )}
      >
        <span className="truncate">{label}</span>
        {active ? (
          <MaterialIcon
            name={sortState.dir === "asc" ? "arrow_upward" : "arrow_downward"}
            filled
            size={16}
            className="shrink-0 text-secondary"
          />
        ) : null}
      </button>
    </th>
  );
}

type AssetManagementTableProps = {
  assets: SettingsAsset[];
  /** Category combobox options (defaults + saved customs + in-use labels). */
  categoryOptions: string[];
  /** Persist a user-typed category so it appears in the list next time. */
  onRegisterCustomCategory?: (category: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (asset: SettingsAsset) => void;
  onAdd: (asset: SettingsAsset) => void;
  /** Called with the full list in new order (persisted by parent, e.g. `settingsAssets`). */
  onReorder: (ordered: SettingsAsset[]) => void;
};

type SortableAssetRowProps = {
  asset: SettingsAsset;
  isLast: boolean;
  onEdit: (asset: SettingsAsset) => void;
  onDeleteRequest: (asset: SettingsAsset) => void;
};

function SortableAssetRow({
  asset,
  isLast,
  onEdit,
  onDeleteRequest,
}: SortableAssetRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        isLast
          ? "hover:bg-surface-container-low transition-colors"
          : "border-b border-surface-variant hover:bg-surface-container-low transition-colors",
        isDragging && "relative z-10 bg-surface-container-lowest shadow-md ring-1 ring-outline-variant",
      )}
    >
      <td className="py-4 pr-0 align-middle">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={`Drag to reorder ${asset.name}`}
          className="inline-flex cursor-grab touch-none rounded-sm border-0 bg-transparent p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:cursor-grabbing"
        >
          <MaterialIcon name="drag_indicator" />
        </button>
      </td>
      <td className="py-4 font-body-md text-body-md text-primary">{asset.name}</td>
      <td className="py-4 font-body-md text-body-md text-on-surface-variant">
        <span
          className={cn(
            "inline-flex max-w-[14rem] truncate rounded-full px-2.5 py-0.5 font-label-sm text-label-sm",
            assetCategoryBadgeClassNames(asset.category),
          )}
        >
          {asset.category}
        </span>
      </td>
      <td className="py-4 font-body-md text-body-md text-on-surface-variant">
        <span
          className={cn(
            "inline-flex max-w-[11rem] rounded-full px-2.5 py-0.5 font-label-sm text-label-sm",
            resolveSettingsAssetLiquidity(asset.liquidity) === "instant"
              ? "bg-secondary-container/35 text-secondary"
              : "bg-surface-container-high text-on-surface-variant",
          )}
        >
          {settingsAssetLiquidityLabel(asset.liquidity)}
        </span>
      </td>
      <td className="py-4 font-data-tabular text-data-tabular text-primary text-right">
        {formatThousands(asset.currentValue)}
      </td>
      <td className="py-4 text-right">
        <button
          type="button"
          aria-label={`Edit ${asset.name}`}
          onClick={() => onEdit(asset)}
          className="text-on-surface-variant hover:text-secondary transition-colors mr-2"
        >
          <MaterialIcon name="edit" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${asset.name}`}
          onClick={() => onDeleteRequest(asset)}
          className="text-on-surface-variant hover:text-error transition-colors"
        >
          <MaterialIcon name="delete" />
        </button>
      </td>
    </tr>
  );
}

export function AssetManagementTable({
  assets,
  categoryOptions,
  onRegisterCustomCategory,
  onDelete,
  onUpdate,
  onAdd,
  onReorder,
}: AssetManagementTableProps) {
  type AssetDialogMode = "idle" | "edit" | "create";
  const [assetDialogMode, setAssetDialogMode] = useState<AssetDialogMode>("idle");
  const [assetDraft, setAssetDraft] = useState<SettingsAsset | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SettingsAsset | null>(null);

  const [sort, setSort] = useState<AssetSortState | null>(null);

  const displayAssets = useMemo(() => {
    if (!sort) return assets;
    return sortAssetsList(assets, sort.key, sort.dir);
  }, [assets, sort]);

  const sortableIds = useMemo(() => displayAssets.map((a) => a.id), [displayAssets]);

  function toggleSortColumn(key: AssetSortKey) {
    setSort((prev) => nextSortState(prev, key));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = displayAssets.findIndex((a) => a.id === active.id);
    const newIndex = displayAssets.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(displayAssets, oldIndex, newIndex));
    setSort(null);
  }

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
      liquidity: SETTINGS_ASSET_LIQUIDITY_DEFAULT,
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
      liquidity: resolveSettingsAssetLiquidity(assetDraft.liquidity),
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr>
                <th
                  className="pb-3 w-10 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant"
                  aria-label="Reorder"
                />
                <SortColumnHeader
                  label="Asset Name"
                  sortKey="name"
                  sort={sort}
                  onToggleSort={toggleSortColumn}
                />
                <SortColumnHeader
                  label="Category"
                  sortKey="category"
                  sort={sort}
                  onToggleSort={toggleSortColumn}
                />
                <SortColumnHeader
                  label="Access"
                  sortKey="liquidity"
                  sort={sort}
                  onToggleSort={toggleSortColumn}
                />
                <SortColumnHeader
                  label="Current Value (₫)"
                  sortKey="value"
                  align="right"
                  sort={sort}
                  onToggleSort={toggleSortColumn}
                />
                <th
                  scope="col"
                  className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <tbody>
                {displayAssets.map((asset, idx) => (
                  <SortableAssetRow
                    key={asset.id}
                    asset={asset}
                    isLast={idx === displayAssets.length - 1}
                    onEdit={openEdit}
                    onDeleteRequest={requestDelete}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
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
          <div className="mt-1">
            <p className="mb-1.5 font-body-sm text-body-sm text-on-surface-variant">
              How quickly can you access this value?
            </p>
            <ToggleButtonGroup
              exclusive
              fullWidth
              color="primary"
              value={resolveSettingsAssetLiquidity(assetDraft?.liquidity)}
              onChange={(_, v: SettingsAssetLiquidity | null) => {
                if (v !== null) {
                  setAssetDraft((d) => (d ? { ...d, liquidity: v } : d));
                }
              }}
              aria-label="Asset liquidity"
            >
              <ToggleButton value="instant" className="font-body-sm normal-case">
                Instant
              </ToggleButton>
              <ToggleButton value="not_instant" className="font-body-sm normal-case">
                Not instant
              </ToggleButton>
            </ToggleButtonGroup>
            <FormHelperText className="mx-0">
              Instant: cash or equivalents you can withdraw or spend right away. Not instant: term
              deposits, locked products, or anything with a meaningful delay or penalty.
            </FormHelperText>
          </div>
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
