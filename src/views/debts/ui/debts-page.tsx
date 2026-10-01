"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Pencil, Percent, Plus, Trash2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createDebtDraft,
  DEBTS_SEED,
  describeDebtPayment,
  sanitizeDebt,
  totalDebtBalance,
  weightedAverageRate,
  type Debt,
} from "@/entities/debt";
import { formatPercent } from "@/shared/lib/format";
import { useTable } from "@/shared/storage";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, DataTableColumnHeader, RowActions } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { StatCard, StatGrid } from "@/shared/ui/stat-card";
import { PageContainer } from "@/widgets/app-shell";

import { useCreateParam } from "@/shared/lib/use-create-param";

import { DebtFormDialog } from "./debt-form-dialog";

type DialogState = { mode: "create" | "edit"; debt: Debt };

export function DebtsPage() {
  const [debts, setDebts] = useTable("debts", DEBTS_SEED);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Debt | null>(null);

  const openCreate = () => {
    setDialog({ mode: "create", debt: createDebtDraft() });
    setDialogOpen(true);
  };
  const openEdit = (debt: Debt) => {
    setDialog({ mode: "edit", debt: { ...debt } });
    setDialogOpen(true);
  };
  useCreateParam(openCreate, (id) => {
    const d = debts.find((x) => x.id === id);
    if (d) openEdit(d);
  });

  const total = totalDebtBalance(debts);
  const variableTotal = debts.filter((d) => d.rateKind === "Variable").reduce((s, d) => s + d.balance, 0);

  const columns = useMemo<ColumnDef<Debt>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" align="right" />,
        cell: ({ row }) => <Money value={row.original.balance} />,
        footer: () => <Money value={total} className="font-semibold" />,
        meta: { align: "right" },
      },
      {
        accessorKey: "ratePct",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Rate" align="right" />,
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-end gap-2">
            <span className="tabular-nums">{formatPercent(row.original.ratePct, { maximumFractionDigits: 3 })}</span>
            <Badge variant={row.original.rateKind === "Variable" ? "warning" : "neutral"}>{row.original.rateKind}</Badge>
          </span>
        ),
        meta: { align: "right" },
      },
      {
        id: "payment",
        header: "Payment",
        enableSorting: false,
        cell: ({ row }) => {
          const p = describeDebtPayment(row.original);
          return (
            <div className="max-w-64 whitespace-normal">
              <p>{p.primary}</p>
              {p.secondary ? <p className="truncate text-xs text-muted-foreground">{p.secondary}</p> : null}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              { label: "Edit", icon: Pencil, onSelect: () => openEdit(row.original) },
              "separator",
              { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setPendingDelete(row.original) },
            ]}
          />
        ),
        meta: { className: "w-12" },
      },
    ],
    [total],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Debts"
        description="Loans, cards and other liabilities. Balances are subtracted from net worth."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add debt
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Total outstanding" icon={CreditCard} value={<Money value={total} compact />} hint={`${debts.length} ${debts.length === 1 ? "debt" : "debts"}`} />
        <StatCard
          label="Avg interest rate"
          icon={Percent}
          value={formatPercent(weightedAverageRate(debts), { maximumFractionDigits: 2 })}
          hint="Weighted by balance"
        />
        <StatCard
          label="Variable-rate balance"
          icon={TrendingUp}
          value={<Money value={variableTotal} compact />}
          hint={total > 0 ? `${formatPercent((variableTotal / total) * 100, { maximumFractionDigits: 0 })} of all debt` : "No debt"}
        />
        <StatCard
          label="Largest debt"
          value={<Money value={debts.reduce((m, d) => Math.max(m, d.balance), 0)} compact />}
          hint={debts.length ? [...debts].sort((a, b) => b.balance - a.balance)[0].name : "—"}
        />
      </StatGrid>

      <Section title="All debts" flush>
        <DataTable
          columns={columns}
          data={debts}
          getRowId={(d) => d.id}
          onRowClick={openEdit}
          empty={
            <EmptyState
              icon={CreditCard}
              title="No debts recorded"
              description="Track mortgages, car loans and credit cards to see your true net worth."
              action={
                <Button variant="outline" onClick={openCreate}>
                  <Plus />
                  Add debt
                </Button>
              }
            />
          }
          renderMobileItem={(d) => {
            const p = describeDebtPayment(d);
            return (
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(d)}>
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatPercent(d.ratePct, { maximumFractionDigits: 3 })} {d.rateKind.toLowerCase()} · {p.primary}
                  </p>
                </button>
                <Money value={d.balance} className="text-sm font-medium" />
                <RowActions
                  label={`Actions for ${d.name}`}
                  actions={[
                    { label: "Edit", icon: Pencil, onSelect: () => openEdit(d) },
                    "separator",
                    { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setPendingDelete(d) },
                  ]}
                />
              </div>
            );
          }}
        />
      </Section>

      <DebtFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialog?.mode ?? "create"}
        debt={dialog?.debt ?? null}
        onSubmit={(draft) => {
          const next = sanitizeDebt(draft);
          if (dialog?.mode === "edit") {
            setDebts((prev) => prev.map((d) => (d.id === next.id ? next : d)));
            toast.success("Debt updated");
          } else {
            setDebts((prev) => [...prev, next]);
            toast.success("Debt added");
          }
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete debt?"
        description={pendingDelete ? `Remove "${pendingDelete.name}" from your liabilities list?` : null}
        onConfirm={() => {
          if (!pendingDelete) return;
          const removed = pendingDelete;
          setDebts((prev) => prev.filter((d) => d.id !== removed.id));
          toast.success("Debt deleted", { description: removed.name });
        }}
      />
    </PageContainer>
  );
}
