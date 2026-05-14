"use client";

import { Info, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/shared/lib";
import {
  PERSONAL_LOANS_SEED,
  useTable,
  type PersonalLoan,
  type PersonalLoanDirection,
} from "@/shared/storage";

import { LoanCard } from "./loan-card";
import { LoanDialog } from "./loan-dialog";

type DialogMode = "idle" | "create" | "edit";

function emptyLoan(direction: PersonalLoanDirection = "lent_out"): PersonalLoan {
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

export function PersonalLoansPage() {
  const [loans, setLoans] = useTable<PersonalLoan[]>("personalLoans", PERSONAL_LOANS_SEED);

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
        .reduce((sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0), 0),
    [lentOut],
  );
  const totalOpenBorrowed = useMemo(
    () =>
      borrowed
        .filter((l) => l.status === "open")
        .reduce((sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0), 0),
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
      setLoans((prev) => prev.map((l) => (l.id === normalized.id ? normalized : l)));
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
        <h1 className="text-base font-medium">Personal loans</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Personal loans</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            A side notebook for informal money loans.{" "}
            <strong className="text-foreground">These entries are not counted</strong> in net worth,
            allocations, goal plans, or any other calculation.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b">
              <div>
                <CardTitle className="text-base">Owed to you</CardTitle>
                <CardDescription>People who owe you money</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-lg font-semibold font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatVnd(totalOpenLentOut)}
                </p>
                <Button type="button" size="sm" onClick={() => openCreate("lent_out")}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {lentOut.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing here yet. Use “Add” to log money you lent to someone.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b">
              <div>
                <CardTitle className="text-base">You owe</CardTitle>
                <CardDescription>Money you borrowed from people</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-lg font-semibold font-data-tabular tabular-nums text-destructive">
                  {formatVnd(totalOpenBorrowed)}
                </p>
                <Button type="button" size="sm" onClick={() => openCreate("borrowed")}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {borrowed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing here yet. Use “Add” to log money you borrowed from someone.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-4" />
            Totals above only include entries marked “Open”.
          </p>
        </div>

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
