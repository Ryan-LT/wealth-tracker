"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, PiggyBank, Plus, Receipt, Trash2, Pencil } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { ASSETS_SEED, type AssetsState } from "@/entities/asset";
import { buildGoalStartingOptions } from "@/entities/goal";
import {
  createIncomeSourceDraft,
  INCOME_SOURCES_SEED,
  capitalYieldPct,
  effectiveIncomeCapital,
  incomeCapitalPeers,
  sanitizeIncomeSource,
  totalCapitalAmount,
  type IncomeSource,
} from "@/entities/income";
import { summarizeCashflow } from "@/entities/portfolio";
import { applyAverageMonthlySpending, PREFERENCES_SEED } from "@/entities/preferences";
import { SETTINGS_ASSETS_SEED } from "@/entities/settings-asset";
import { formatOrdinal, formatPercent } from "@/shared/lib/format";
import { useCreateParam } from "@/shared/lib/use-create-param";
import { useTable } from "@/shared/storage";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, DataTableColumnHeader, RowActions, type RowAction } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { RegistryIcon } from "@/shared/ui/icon-registry";
import { Button } from "@/shared/ui/kit/button";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageContainer } from "@/widgets/app-shell";

import { IncomeSourceFormDialog } from "./income-source-form-dialog";
import { CashFlowPanel } from "./cash-flow-panel";

type DialogState = { mode: "create" | "edit"; source: IncomeSource };

function KindBadge({ kind }: { kind: IncomeSource["kind"] }) {
  return kind === "active" ? (
    <StatusBadge icon={Briefcase}>Active</StatusBadge>
  ) : (
    <StatusBadge tone="info" icon={PiggyBank}>
      Passive
    </StatusBadge>
  );
}

function paymentLabel(s: IncomeSource): string {
  const parts = [s.paymentDay ? `${formatOrdinal(s.paymentDay)} of month` : null, s.paymentEntity || null].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function IncomePage() {
  const [sources, setSources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IncomeSource | null>(null);

  const cash = summarizeCashflow(prefs, sources);
  const seedOptions = useMemo(() => buildGoalStartingOptions(assets, settingsAssets), [assets, settingsAssets]);
  const peers = useMemo(() => (dialog ? incomeCapitalPeers(sources, dialog.source.id) : []), [sources, dialog]);

  const openCreate = useCallback(() => {
    setDialog({ mode: "create", source: createIncomeSourceDraft() });
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((s: IncomeSource) => {
    setDialog({ mode: "edit", source: { ...s, capitalLines: [...(s.capitalLines ?? [])] } });
    setDialogOpen(true);
  }, []);
  useCreateParam(openCreate, (id) => {
    const s = sources.find((x) => x.id === id);
    if (s) openEdit(s);
  });

  const actionsFor = useCallback(
    (s: IncomeSource): RowAction[] => [
      { label: "Edit", icon: Pencil, onSelect: () => openEdit(s) },
      "separator",
      { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setPendingDelete(s) },
    ],
    [openEdit],
  );

  const columns = useMemo<ColumnDef<IncomeSource>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <RegistryIcon name={row.original.icon} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              {row.original.details ? <p className="truncate text-xs text-muted-foreground">{row.original.details}</p> : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "kind",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => <KindBadge kind={row.original.kind} />,
      },
      {
        id: "payment",
        header: "Payment",
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground">{paymentLabel(row.original)}</span>,
        meta: { className: "hidden xl:table-cell" },
      },
      {
        id: "capital",
        header: "Capital",
        accessorFn: (s) => effectiveIncomeCapital(s, sources, seedOptions),
        cell: ({ row }) => {
          const reserved = totalCapitalAmount(row.original.capitalLines);
          const capital = effectiveIncomeCapital(row.original, sources, seedOptions);
          const yieldPct = capitalYieldPct(row.original.monthly, capital);
          return reserved > 0 ? (
            <div>
              <Money value={capital} />
              <p className="text-xs text-muted-foreground">
                {yieldPct !== null ? `${formatPercent(yieldPct)} yield / yr` : "No yield"}
                {capital < reserved ? <> · of <Money value={reserved} /> reserved</> : null}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
        meta: { align: "right", className: "hidden xl:table-cell" },
      },
      {
        accessorKey: "monthly",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Monthly" align="right" />,
        cell: ({ row }) => <Money value={row.original.monthly} className="font-medium" />,
        footer: () => <Money value={cash.totalIncome} className="font-semibold" />,
        meta: { align: "right" },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowActions label={`Actions for ${row.original.name}`} actions={actionsFor(row.original)} />,
        meta: { className: "w-12" },
      },
    ],
    [actionsFor, cash.totalIncome, sources, seedOptions],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Income & spending"
        description="What comes in each month, what goes out, and what is left to save."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add income source
          </Button>
        }
      />

      <CashFlowPanel
        cash={cash}
        sourceCount={sources.length}
        onAddSource={openCreate}
        onSaveSpending={(amount) => {
          setPrefs((p) => applyAverageMonthlySpending(p, amount));
          toast.success("Average spending saved");
        }}
      />

      <Section title="Income sources" description={`${sources.length} ${sources.length === 1 ? "source" : "sources"}`} flush>
        <DataTable
          columns={columns}
          data={sources}
          getRowId={(s) => s.id}
          onRowClick={openEdit}
          empty={
            <EmptyState
              icon={Receipt}
              title="No income sources yet"
              description="Add your salary, rental or interest income to power the projections."
              action={
                <Button variant="outline" onClick={openCreate}>
                  <Plus />
                  Add income source
                </Button>
              }
            />
          }
          renderMobileItem={(s) => (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <RegistryIcon name={s.icon} />
              </span>
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(s)}>
                <p className="truncate font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.kind === "active" ? "Active" : "Passive"} · {paymentLabel(s)}
                </p>
              </button>
              <Money value={s.monthly} className="text-sm font-medium" />
              <RowActions label={`Actions for ${s.name}`} actions={actionsFor(s)} />
            </div>
          )}
        />
      </Section>

      <IncomeSourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialog?.mode ?? "create"}
        source={dialog?.source ?? null}
        peers={peers}
        seedOptions={seedOptions}
        onSubmit={(draft) => {
          const next = sanitizeIncomeSource(draft);
          if (dialog?.mode === "edit") {
            setSources((prev) => prev.map((s) => (s.id === next.id ? next : s)));
            toast.success("Income source updated");
          } else {
            setSources((prev) => [...prev, next]);
            toast.success("Income source added");
          }
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete income source?"
        description={pendingDelete ? `Remove "${pendingDelete.name}" from your income sources?` : null}
        onConfirm={() => {
          if (!pendingDelete) return;
          const removed = pendingDelete;
          setSources((prev) => prev.filter((s) => s.id !== removed.id));
          toast.success("Income source deleted", { description: removed.name });
        }}
      />
    </PageContainer>
  );
}
