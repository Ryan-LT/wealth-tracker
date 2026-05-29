"use client";

import { Info, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Header } from "@/widgets/page-header";
import { Main } from "@/widgets/page-shell";
import { ProfileDropdown } from "@/widgets/profile-menu";
import { ThemeSwitch } from "@/widgets/theme-switch";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PERSONAL_LOANS_SEED,
  type PersonalLoan,
  type PersonalLoanDirection,
} from "@/entities/personal-loan";
import { formatVnd } from "@/shared/lib";
import { useHydrated, useTable } from "@/shared/storage";

import { LoanCard, LoanCardSkeleton } from "./loan-card";
import { LoanDialog } from "./loan-dialog";

type DialogMode = "idle" | "create" | "edit";

function emptyLoan(
  direction: PersonalLoanDirection = "lent_out",
): PersonalLoan {
  return {
    id: `loan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    person: "",
    amount: 0,
    direction,
    date: new Date().toISOString().slice(0, 10),
    status: "open",
    note: "",
  };
}

function sortLoans(loans: PersonalLoan[]): PersonalLoan[] {
  return [...loans].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    if (ad !== bd) return ad < bd ? 1 : -1;
    return a.person.localeCompare(b.person);
  });
}

export function LoansPage() {
  const hydrated = useHydrated();
  const [loans, setLoans] = useTable<PersonalLoan[]>(
    "personalLoans",
    PERSONAL_LOANS_SEED,
  );

  const [mode, setMode] = useState<DialogMode>("idle");
  const [draft, setDraft] = useState<PersonalLoan | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PersonalLoan | null>(null);

  const lentOut = useMemo(
    () => sortLoans(loans.filter((l) => l.direction === "lent_out")),
    [loans],
  );
  const borrowed = useMemo(
    () => sortLoans(loans.filter((l) => l.direction === "borrowed")),
    [loans],
  );

  const totalOpenLentOut = useMemo(
    () =>
      lentOut
        .filter((l) => l.status === "open")
        .reduce(
          (sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0),
          0,
        ),
    [lentOut],
  );
  const totalOpenBorrowed = useMemo(
    () =>
      borrowed
        .filter((l) => l.status === "open")
        .reduce(
          (sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0),
          0,
        ),
    [borrowed],
  );

  function openCreate(direction: PersonalLoanDirection) {
    setDraft(emptyLoan(direction));
    setMode("create");
  }

  function openEdit(loan: PersonalLoan) {
    setDraft({ ...loan });
    setMode("edit");
  }

  function closeDialog() {
    setMode("idle");
    setDraft(null);
  }

  function saveDialog() {
    if (!draft) return;
    const normalized: PersonalLoan = {
      ...draft,
      person: draft.person.trim() || "Someone",
      amount: Math.max(0, Number.isFinite(draft.amount) ? draft.amount : 0),
      note: draft.note?.trim() ? draft.note.trim() : undefined,
      date: draft.date && draft.date.trim() ? draft.date : undefined,
      status: draft.status === "settled" ? "settled" : "open",
    };
    if (mode === "create") {
      setLoans((prev) => [...prev, normalized]);
    } else if (mode === "edit") {
      setLoans((prev) =>
        prev.map((l) => (l.id === normalized.id ? normalized : l)),
      );
    }
    closeDialog();
  }

  function requestDelete(loan: PersonalLoan) {
    setPendingDelete(loan);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      setLoans((prev) => prev.filter((l) => l.id !== pendingDelete.id));
    }
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  function toggleSettled(loan: PersonalLoan) {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loan.id
          ? { ...l, status: l.status === "settled" ? "open" : "settled" }
          : l,
      ),
    );
  }

  return (
    <>
      <Header fixed>
        <h1 className="text-lg font-semibold md:text-base md:font-medium">
          Personal loans
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
              <div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Owed to you
                </CardTitle>
                <p className="mt-1 text-2xl font-bold font-data-tabular tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 leading-8">
                  {hydrated ? (
                    formatVnd(totalOpenLentOut)
                  ) : (
                    <Skeleton className="h-7 w-32 inline-block align-middle" />
                  )}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => openCreate("lent_out")}
                disabled={!hydrated}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {!hydrated ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <LoanCardSkeleton key={i} />
                  ))}
                </div>
              ) : lentOut.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nothing here yet. Use “Add” to log money you lent.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lentOut.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      onEdit={() => openEdit(loan)}
                      onDelete={() => requestDelete(loan)}
                      onToggleSettled={() => toggleSettled(loan)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="outflow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2">
              <div>
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  You owe
                </CardTitle>
                <p className="mt-1 text-2xl font-bold font-data-tabular tabular-nums tracking-tight text-destructive leading-8">
                  {hydrated ? (
                    formatVnd(totalOpenBorrowed)
                  ) : (
                    <Skeleton className="h-7 w-32 inline-block align-middle" />
                  )}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => openCreate("borrowed")}
                disabled={!hydrated}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {!hydrated ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <LoanCardSkeleton key={i} />
                  ))}
                </div>
              ) : borrowed.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nothing here yet. Use “Add” to log money you borrowed.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {borrowed.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      onEdit={() => openEdit(loan)}
                      onDelete={() => requestDelete(loan)}
                      onToggleSettled={() => toggleSettled(loan)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5" />
          Totals include open entries only.
        </p>

        <LoanDialog
          open={mode !== "idle"}
          mode={mode === "edit" ? "edit" : "create"}
          draft={draft}
          onChange={setDraft}
          onClose={closeDialog}
          onSave={saveDialog}
        />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete loan note?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete
                  ? `Remove the ${formatVnd(pendingDelete.amount)} entry with "${pendingDelete.person}"?`
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
      </Main>
    </>
  );
}
