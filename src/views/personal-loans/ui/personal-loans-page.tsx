"use client";

import { useMemo, useState } from "react";

import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { formatVnd } from "@/shared/lib";
import {
  PERSONAL_LOANS_SEED,
  useTable,
  type PersonalLoan,
  type PersonalLoanDirection,
} from "@/shared/storage";
import { Button, Card, MaterialIcon, SectionHeader } from "@/shared/ui";

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
    <main className="flex w-full min-w-0 flex-1 flex-col overflow-y-auto bg-background pb-24 pt-stack-lg max-md:px-margin-mobile md:min-h-screen md:px-stack-lg md:pb-8">
      <header className="mb-stack-md">
        <h1 className="font-headline-lg text-headline-lg text-primary">Personal loans</h1>
        <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
          A side notebook for informal money loans between you and other people.{" "}
          <strong className="text-on-surface">These entries are not counted</strong> in net worth,
          allocations, goal plans, or any other calculation — they live here purely as a reminder.
        </p>
      </header>

      <div className="flex flex-col gap-stack-lg">
        <Card variant="section" className="p-6">
          <SectionHeader
            title="Owed to you"
            subtitle="People who owe you money"
            end={
              <div className="flex flex-col items-end gap-2">
                <p className="font-data-tabular text-data-tabular text-lg font-semibold text-secondary">
                  {formatVnd(totalOpenLentOut)}
                </p>
                <Button type="button" onClick={() => openCreate("lent_out")}>
                  Add
                </Button>
              </div>
            }
          />
          {lentOut.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Nothing here yet. Use “Add” to log money you lent to someone.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
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
        </Card>

        <Card variant="section" className="p-6">
          <SectionHeader
            title="You owe"
            subtitle="Money you borrowed from people"
            end={
              <div className="flex flex-col items-end gap-2">
                <p className="font-data-tabular text-data-tabular text-lg font-semibold text-error">
                  {formatVnd(totalOpenBorrowed)}
                </p>
                <Button type="button" onClick={() => openCreate("borrowed")}>
                  Add
                </Button>
              </div>
            }
          />
          {borrowed.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Nothing here yet. Use “Add” to log money you borrowed from someone.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
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
        </Card>

        <p className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <MaterialIcon name="info" size={18} />
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

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete loan note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete
              ? `Remove the ${formatVnd(pendingDelete.amount)} entry with “${pendingDelete.person}”?`
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
    </main>
  );
}
