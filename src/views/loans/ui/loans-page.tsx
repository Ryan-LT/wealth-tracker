"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, CircleCheck, HandCoins, Pencil, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createPersonalLoanDraft,
  PERSONAL_LOANS_SEED,
  sanitizePersonalLoan,
  sortPersonalLoans,
  toggleLoanStatus,
  totalOpenAmount,
  type PersonalLoan,
  type PersonalLoanDirection,
} from "@/entities/personal-loan";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { useCreateParam } from "@/shared/lib/use-create-param";
import { useTable } from "@/shared/storage";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, DataTableColumnHeader, DataTableToolbar, matchesSearch, RowActions, type RowAction } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/kit/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { StatCard, StatGrid } from "@/shared/ui/stat-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageContainer } from "@/widgets/app-shell";

import { LoanFormDialog } from "./loan-form-dialog";

type DirectionFilter = "all" | PersonalLoanDirection;
type StatusFilter = "all" | "open" | "settled";
type DialogState = { mode: "create" | "edit"; loan: PersonalLoan };

function DirectionBadge({ direction }: { direction: PersonalLoanDirection }) {
  return direction === "lent_out" ? (
    <StatusBadge tone="success" icon={ArrowUpRight}>
      Owed to you
    </StatusBadge>
  ) : (
    <StatusBadge tone="danger" icon={ArrowDownLeft}>
      You owe
    </StatusBadge>
  );
}

export function LoansPage() {
  const [loans, setLoans] = useTable<PersonalLoan[]>("personalLoans", PERSONAL_LOANS_SEED);
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PersonalLoan | null>(null);

  const openCreate = useCallback(() => {
    setDialog({ mode: "create", loan: createPersonalLoanDraft(direction === "borrowed" ? "borrowed" : "lent_out") });
    setDialogOpen(true);
  }, [direction]);
  const openEdit = useCallback((loan: PersonalLoan) => {
    setDialog({ mode: "edit", loan: { ...loan } });
    setDialogOpen(true);
  }, []);
  useCreateParam(openCreate);

  const toggle = useCallback(
    (loan: PersonalLoan) => {
      const next = toggleLoanStatus(loan);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? next : l)));
      toast.success(next.status === "settled" ? "Marked as settled" : "Reopened", { description: loan.person });
    },
    [setLoans],
  );

  const actionsFor = useCallback(
    (loan: PersonalLoan): RowAction[] => [
      loan.status === "open"
        ? { label: "Mark settled", icon: CircleCheck, onSelect: () => toggle(loan) }
        : { label: "Reopen", icon: RotateCcw, onSelect: () => toggle(loan) },
      { label: "Edit", icon: Pencil, onSelect: () => openEdit(loan) },
      "separator",
      { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setPendingDelete(loan) },
    ],
    [toggle, openEdit],
  );

  const owedToYou = totalOpenAmount(loans, "lent_out");
  const youOwe = totalOpenAmount(loans, "borrowed");
  const openCount = loans.filter((l) => l.status === "open").length;

  const visible = useMemo(
    () =>
      sortPersonalLoans(loans).filter(
        (l) =>
          (direction === "all" || l.direction === direction) &&
          (status === "all" || l.status === status) &&
          matchesSearch(`${l.person} ${l.note ?? ""}`, search),
      ),
    [loans, direction, status, search],
  );

  const columns = useMemo<ColumnDef<PersonalLoan>[]>(
    () => [
      {
        accessorKey: "person",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Person" />,
        cell: ({ row }) => (
          <div className="max-w-56 min-w-0 whitespace-normal">
            <p className={row.original.status === "settled" ? "font-medium text-muted-foreground" : "font-medium"}>{row.original.person}</p>
            {row.original.note ? <p className="truncate text-xs text-muted-foreground">{row.original.note}</p> : null}
          </div>
        ),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        enableSorting: false,
        cell: ({ row }) => <DirectionBadge direction={row.original.direction} />,
      },
      {
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        sortUndefined: "last",
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatDate(row.original.date)}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.status === "open" ? <StatusBadge tone="info" dot>Open</StatusBadge> : <StatusBadge dot>Settled</StatusBadge>,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" align="right" />,
        cell: ({ row }) => (
          <Money
            value={row.original.amount}
            strike={row.original.status === "settled"}
            tone={row.original.status === "settled" ? "muted" : row.original.direction === "lent_out" ? "success" : "danger"}
            className="font-medium"
          />
        ),
        meta: { align: "right" },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowActions label={`Actions for ${row.original.person}`} actions={actionsFor(row.original)} />,
        meta: { className: "w-12" },
      },
    ],
    [actionsFor],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Personal loans"
        description="Informal money lent or borrowed. A private log — not counted in net worth."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add loan
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Owed to you" icon={ArrowUpRight} value={<Money value={owedToYou} compact tone="success" />} hint="Open entries you lent" />
        <StatCard label="You owe" icon={ArrowDownLeft} value={<Money value={youOwe} compact tone="danger" />} hint="Open entries you borrowed" />
        <StatCard label="Net position" icon={Scale} value={<Money value={owedToYou - youOwe} compact signed tone="auto" />} hint="Owed to you − you owe" />
        <StatCard label="Open entries" icon={HandCoins} value={openCount} hint={`${loans.length - openCount} settled`} />
      </StatGrid>

      <Section title="Loan log" description="Totals include open entries only." flush>
        <div className="border-b px-5 py-3">
          <DataTableToolbar search={search} onSearchChange={setSearch} placeholder="Search people or notes…">
            <SegmentedControl<DirectionFilter>
              aria-label="Direction"
              value={direction}
              onValueChange={setDirection}
              options={[
                { value: "all", label: "All" },
                { value: "lent_out", label: "Owed to you" },
                { value: "borrowed", label: "You owe" },
              ]}
            />
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-32" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </DataTableToolbar>
        </div>
        <DataTable
          columns={columns}
          data={visible}
          getRowId={(l) => l.id}
          manualSorting={false}
          onRowClick={openEdit}
          empty={
            loans.length === 0 ? (
              <EmptyState
                icon={HandCoins}
                title="No loans logged"
                description="Keep track of money you lent to or borrowed from friends and family."
                action={
                  <Button variant="outline" onClick={openCreate}>
                    <Plus />
                    Add loan
                  </Button>
                }
              />
            ) : (
              <EmptyState title="No loans match these filters" description="Try another direction, status or search." />
            )
          }
          renderMobileItem={(l) => (
            <div className="flex items-center gap-3 px-4 py-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(l)}>
                <p className={l.status === "settled" ? "truncate font-medium text-muted-foreground" : "truncate font-medium"}>{l.person}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {l.direction === "lent_out" ? "Owed to you" : "You owe"} · {formatDate(l.date)}
                  {l.status === "settled" ? " · Settled" : ""}
                </p>
              </button>
              <Money
                value={l.amount}
                strike={l.status === "settled"}
                tone={l.status === "settled" ? "muted" : l.direction === "lent_out" ? "success" : "danger"}
                className="text-sm font-medium"
              />
              <RowActions label={`Actions for ${l.person}`} actions={actionsFor(l)} />
            </div>
          )}
        />
      </Section>

      <LoanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialog?.mode ?? "create"}
        loan={dialog?.loan ?? null}
        onSubmit={(draft) => {
          const next = sanitizePersonalLoan(draft);
          if (dialog?.mode === "edit") {
            setLoans((prev) => prev.map((l) => (l.id === next.id ? next : l)));
            toast.success("Loan updated");
          } else {
            setLoans((prev) => [...prev, next]);
            toast.success("Loan added");
          }
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete loan entry?"
        description={pendingDelete ? `Remove the ${formatMoney(pendingDelete.amount)} entry with "${pendingDelete.person}"?` : null}
        onConfirm={() => {
          if (!pendingDelete) return;
          const removed = pendingDelete;
          setLoans((prev) => prev.filter((l) => l.id !== removed.id));
          toast.success("Loan deleted", { description: removed.person });
        }}
      />
    </PageContainer>
  );
}
