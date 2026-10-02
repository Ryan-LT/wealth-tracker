"use client";

import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Clock, Landmark, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { ASSETS_SEED, type AssetsState } from "@/entities/asset";
import { totalCombinedAssetValue } from "@/entities/portfolio";
import { PREFERENCES_SEED, registerExtraAssetCategory } from "@/entities/preferences";
import {
  createSettingsAssetDraft,
  customCategoryToRegister,
  mergeAssetCategoryOptions,
  reorderVisible,
  resolveSettingsAssetLiquidity,
  sanitizeSettingsAsset,
  SETTINGS_ASSETS_SEED,
  sortSettingsAssets,
  totalSettingsAssetsValue,
  type AssetSortKey,
  type AssetSortState,
  type SettingsAsset,
} from "@/entities/settings-asset";
import { CategoryBadge, LiquidityBadge } from "@/entities/settings-asset/ui";
import { useCreateParam } from "@/shared/lib/use-create-param";
import { useTable } from "@/shared/storage";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, DataTableColumnHeader, DataTableToolbar, matchesSearch, RowActions, type RowAction } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/kit/button";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { StatCard, StatGrid } from "@/shared/ui/stat-card";
import { PageContainer } from "@/widgets/app-shell";

import { AssetFormDialog } from "./asset-form-dialog";
import { LegacyHoldings } from "./legacy-holdings";

const COLUMN_TO_KEY: Record<string, AssetSortKey> = {
  name: "name",
  category: "category",
  liquidity: "liquidity",
  currentValue: "value",
};
const KEY_TO_COLUMN: Record<AssetSortKey, string> = {
  name: "name",
  category: "category",
  liquidity: "liquidity",
  value: "currentValue",
};

type DialogState = { mode: "create" | "edit"; asset: SettingsAsset };

export function AssetsPage() {
  const [assets, setAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [legacy] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const [sort, setSort] = useState<AssetSortState | null>(null);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SettingsAsset | null>(null);

  const categoryOptions = useMemo(() => mergeAssetCategoryOptions(prefs, assets), [prefs, assets]);

  // Domain sort (keeps the id tie-break); the table only renders.
  const displayed = useMemo(() => (sort ? sortSettingsAssets(assets, sort.key, sort.dir) : assets), [assets, sort]);
  const visible = useMemo(
    () => displayed.filter((a) => matchesSearch(`${a.name} ${a.category}`, search)),
    [displayed, search],
  );
  const sorting: SortingState = sort ? [{ id: KEY_TO_COLUMN[sort.key], desc: sort.dir === "desc" }] : [];

  const openCreate = useCallback(() => {
    setDialog({ mode: "create", asset: createSettingsAssetDraft() });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((asset: SettingsAsset) => {
    setDialog({ mode: "edit", asset: { ...asset } });
    setDialogOpen(true);
  }, []);
  useCreateParam(openCreate, (id) => {
    const a = assets.find((x) => x.id === id);
    if (a) openEdit(a);
  });

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      const next = reorderVisible(displayed, activeId, overId);
      if (!next) return;
      setAssets(() => next);
      setSort(null);
    },
    [displayed, setAssets],
  );

  const actionsFor = useCallback(
    (asset: SettingsAsset, withMove: boolean): RowAction[] => {
      const index = displayed.findIndex((a) => a.id === asset.id);
      const canMove = !search.trim();
      const moves: RowAction[] = withMove
        ? [
            {
              label: "Move up",
              icon: ArrowUp,
              disabled: !canMove || index <= 0,
              onSelect: () => reorder(asset.id, displayed[index - 1].id),
            },
            {
              label: "Move down",
              icon: ArrowDown,
              disabled: !canMove || index === -1 || index >= displayed.length - 1,
              onSelect: () => reorder(asset.id, displayed[index + 1].id),
            },
            "separator",
          ]
        : [];
      return [
        { label: "Edit", icon: Pencil, onSelect: () => openEdit(asset) },
        ...moves,
        ...(withMove ? [] : (["separator"] as RowAction[])),
        { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setPendingDelete(asset) },
      ];
    },
    [displayed, search, reorder, openEdit],
  );

  const catalogTotal = totalSettingsAssetsValue(assets);
  const instantTotal = assets
    .filter((a) => resolveSettingsAssetLiquidity(a.liquidity) === "instant")
    .reduce((s, a) => s + Math.max(0, a.currentValue), 0);
  const grossTotal = totalCombinedAssetValue(legacy, assets);

  const columns = useMemo<ColumnDef<SettingsAsset>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <CategoryBadge category={row.original.category} />,
      },
      {
        id: "liquidity",
        accessorFn: (a) => resolveSettingsAssetLiquidity(a.liquidity),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Access" />,
        cell: ({ row }) => <LiquidityBadge liquidity={row.original.liquidity} />,
      },
      {
        accessorKey: "currentValue",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" align="right" />,
        cell: ({ row }) => <Money value={row.original.currentValue} className="font-medium" />,
        footer: () => <Money value={catalogTotal} className="font-semibold" />,
        meta: { align: "right" },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowActions label={`Actions for ${row.original.name}`} actions={actionsFor(row.original, false)} />,
        meta: { className: "w-12" },
      },
    ],
    [actionsFor, catalogTotal],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Assets"
        description="Everything you own and how quickly you can access it."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add asset
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Total assets" icon={Landmark} value={<Money value={grossTotal} compact />} hint={`${assets.length} tracked ${assets.length === 1 ? "asset" : "assets"}`} />
        <StatCard label="Instant access" icon={Zap} value={<Money value={instantTotal} compact />} hint="Cash and equivalents" />
        <StatCard label="Not instant" icon={Clock} value={<Money value={catalogTotal - instantTotal} compact />} hint="Locked, property, term" />
        <StatCard label="Categories" value={new Set(assets.map((a) => a.category.trim())).size} hint={`${categoryOptions.length} available`} />
      </StatGrid>

      <Section title="All assets" description="Drag rows to set your preferred order." flush>
        <div className="border-b px-5 py-3">
          <DataTableToolbar search={search} onSearchChange={setSearch} placeholder="Search name or category…" />
        </div>
        <DataTable
          columns={columns}
          data={visible}
          getRowId={(a) => a.id}
          getRowLabel={(a) => a.name}
          manualSorting
          sorting={sorting}
          onSortingChange={(updater) => {
            const next = typeof updater === "function" ? updater(sorting) : updater;
            const first = next[0];
            setSort(first ? { key: COLUMN_TO_KEY[first.id], dir: first.desc ? "desc" : "asc" } : null);
          }}
          reorder={{
            enabled: !search.trim(),
            disabledReason: "Clear the search to reorder",
            onReorder: reorder,
          }}
          onRowClick={openEdit}
          empty={
            assets.length === 0 ? (
              <EmptyState
                icon={Landmark}
                title="No assets yet"
                description="Add cash, investments, property and anything else you own."
                action={
                  <Button variant="outline" onClick={openCreate}>
                    <Plus />
                    Add asset
                  </Button>
                }
              />
            ) : (
              <EmptyState title="No assets match your search" />
            )
          }
          renderMobileItem={(a) => (
            <div className="flex items-center gap-3 px-4 py-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(a)}>
                <p className="truncate font-medium">{a.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={a.category} />
                  <LiquidityBadge liquidity={a.liquidity} />
                </div>
              </button>
              <Money value={a.currentValue} className="text-sm font-medium" />
              <RowActions label={`Actions for ${a.name}`} actions={actionsFor(a, true)} />
            </div>
          )}
        />
      </Section>

      <LegacyHoldings assets={legacy} />

      <AssetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialog?.mode ?? "create"}
        asset={dialog?.asset ?? null}
        categoryOptions={categoryOptions}
        onSubmit={(draft) => {
          const next = sanitizeSettingsAsset(draft);
          const custom = customCategoryToRegister(next.category);
          if (custom) setPrefs((p) => registerExtraAssetCategory(p, custom));
          if (dialog?.mode === "edit") {
            setAssets((prev) => prev.map((a) => (a.id === next.id ? next : a)));
            toast.success("Asset updated");
          } else {
            setAssets((prev) => [...prev, next]);
            toast.success("Asset added");
          }
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete asset?"
        description={
          pendingDelete ? `This removes "${pendingDelete.name}" from your list. Goal plans using it lose that allocation.` : null
        }
        onConfirm={() => {
          if (!pendingDelete) return;
          const removed = pendingDelete;
          setAssets((prev) => prev.filter((a) => a.id !== removed.id));
          toast.success("Asset deleted", { description: removed.name });
        }}
      />
    </PageContainer>
  );
}
