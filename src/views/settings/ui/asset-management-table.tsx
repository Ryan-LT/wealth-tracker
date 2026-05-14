"use client";

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
import {
  ArrowDown,
  ArrowUp,
  Building2,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { assetCategoryBadgeClassNames, isDefaultAssetCategory } from "@/shared/config";
import { formatThousands } from "@/shared/lib";
import {
  SETTINGS_ASSET_LIQUIDITY_DEFAULT,
  type SettingsAsset,
  type SettingsAssetLiquidity,
  resolveSettingsAssetLiquidity,
  settingsAssetLiquidityLabel,
} from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

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
    <TableHead
      aria-sort={active ? (sortState.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn(align === "right" && "text-right")}
    >
      <button
        type="button"
        onClick={() => onToggleSort(sortKey)}
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded font-medium text-muted-foreground transition-colors hover:text-foreground",
          align === "right" && "w-full justify-end",
        )}
      >
        <span className="truncate">{label}</span>
        {active ? (
          sortState.dir === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0 text-primary" />
          ) : (
            <ArrowDown className="size-3.5 shrink-0 text-primary" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}

type AssetManagementTableProps = {
  assets: SettingsAsset[];
  categoryOptions: string[];
  onRegisterCustomCategory?: (category: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (asset: SettingsAsset) => void;
  onAdd: (asset: SettingsAsset) => void;
  onReorder: (ordered: SettingsAsset[]) => void;
};

type SortableAssetRowProps = {
  asset: SettingsAsset;
  onEdit: (asset: SettingsAsset) => void;
  onDeleteRequest: (asset: SettingsAsset) => void;
};

function SortableAssetRow({ asset, onEdit, onDeleteRequest }: SortableAssetRowProps) {
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
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "relative z-10 bg-muted shadow-md")}
    >
      <TableCell className="w-10 pr-0">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={`Drag to reorder ${asset.name}`}
          className="inline-flex cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="text-sm font-medium">{asset.name}</TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex max-w-[14rem] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold",
            assetCategoryBadgeClassNames(asset.category),
          )}
        >
          {asset.category}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex max-w-[11rem] rounded-full px-2 py-0.5 text-[10px] font-semibold",
            resolveSettingsAssetLiquidity(asset.liquidity) === "instant"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {settingsAssetLiquidityLabel(asset.liquidity)}
        </span>
      </TableCell>
      <TableCell className="text-right font-data-tabular tabular-nums">
        {formatThousands(asset.currentValue)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Edit ${asset.name}`}
          onClick={() => onEdit(asset)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${asset.name}`}
          onClick={() => onDeleteRequest(asset)}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <h2 className="text-base font-semibold">Asset Management</h2>
        </div>
        <Button onClick={openCreate} size="sm">
          Add Asset
        </Button>
      </div>
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" aria-label="Reorder" />
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <TableBody>
                {displayAssets.map((asset) => (
                  <SortableAssetRow
                    key={asset.id}
                    asset={asset}
                    onEdit={openEdit}
                    onDeleteRequest={requestDelete}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>

      <Dialog open={assetDialogOpen} onOpenChange={(o) => !o && closeAssetDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {assetDialogMode === "create" ? "Add asset" : "Edit asset"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-name">Asset name</Label>
              <Input
                id="asset-name"
                autoFocus
                value={assetDraft?.name ?? ""}
                onChange={(e) => setAssetDraft((d) => (d ? { ...d, name: e.target.value } : d))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-category">Category</Label>
              <Input
                id="asset-category"
                list="asset-category-options"
                value={assetDraft?.category ?? ""}
                onChange={(e) =>
                  setAssetDraft((d) => (d ? { ...d, category: e.target.value } : d))
                }
              />
              <datalist id="asset-category-options">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Access</Label>
              <Select
                value={resolveSettingsAssetLiquidity(assetDraft?.liquidity)}
                onValueChange={(v) =>
                  setAssetDraft((d) =>
                    d ? { ...d, liquidity: v as SettingsAssetLiquidity } : d,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="not_instant">Not instant</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Instant: cash or equivalents. Not instant: locked, term deposits, etc.
              </p>
            </div>
            <MoneyInput
              label="Current value (₫)"
              value={assetDraft?.currentValue ?? 0}
              min={0}
              onChange={(v) =>
                setAssetDraft((d) => (d ? { ...d, currentValue: Math.max(0, v) } : d))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeAssetDialog}>
              Cancel
            </Button>
            <Button onClick={saveAssetDialog}>
              {assetDialogMode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This will remove "${pendingDelete.name}" from your list. This cannot be undone.`
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
