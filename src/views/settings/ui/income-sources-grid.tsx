"use client";

import { Receipt } from "lucide-react";
import { useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IncomeSource, IncomeSourceKind } from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

import { IncomeSourceCard, IncomeSourceCardSkeleton } from "./income-source-card";

function newIncomeSourceDraft(): IncomeSource {
  return {
    id: `income-${Date.now()}`,
    kind: "active",
    name: "",
    details: "",
    icon: "work",
    monthly: 0,
  };
}

type IncomeSourcesGridProps = {
  sources: IncomeSource[];
  onCreate: (source: IncomeSource) => void;
  onUpdate: (source: IncomeSource) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

export function IncomeSourcesGrid({
  sources,
  onCreate,
  onUpdate,
  onDelete,
  loading = false,
}: IncomeSourcesGridProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [draft, setDraft] = useState<IncomeSource | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IncomeSource | null>(null);

  function openCreate() {
    setIsCreate(true);
    setDraft(newIncomeSourceDraft());
    setFormOpen(true);
  }

  function openEdit(source: IncomeSource) {
    setIsCreate(false);
    setDraft({ ...source });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setDraft(null);
  }

  function saveForm() {
    if (!draft?.id || !draft.name.trim()) return;
    const normalizedCapital =
      typeof draft.capital === "number" && Number.isFinite(draft.capital)
        ? Math.max(0, draft.capital)
        : 0;
    const normalized: IncomeSource = {
      ...draft,
      name: draft.name.trim(),
      details: draft.details.trim(),
      monthly: Number.isFinite(draft.monthly) ? Math.max(0, draft.monthly) : 0,
      capital: normalizedCapital > 0 ? normalizedCapital : undefined,
      paymentEntity:
        draft.paymentEntity?.trim() === "" ? undefined : draft.paymentEntity?.trim(),
      paymentDay:
        draft.paymentDay !== undefined &&
        draft.paymentDay !== null &&
        draft.paymentDay >= 1 &&
        draft.paymentDay <= 31
          ? draft.paymentDay
          : undefined,
    };
    if (isCreate) {
      onCreate(normalized);
    } else {
      onUpdate(normalized);
    }
    closeForm();
  }

  function requestDelete(source: IncomeSource) {
    setPendingDelete(source);
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
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b [.border-b]:pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Receipt className="size-4 text-primary" />
          Income Sources
        </CardTitle>
        <Button variant="outline" size="sm" onClick={openCreate}>
          Add Source
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <IncomeSourceCardSkeleton key={i} />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No income sources yet. Click &quot;Add Source&quot; to create one.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sources.map((source) => (
              <IncomeSourceCard
                key={source.id}
                source={source}
                onEdit={() => openEdit(source)}
                onDelete={() => requestDelete(source)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Add income source" : "Edit income source"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Tabs
                value={draft?.kind ?? "active"}
                onValueChange={(v) =>
                  setDraft((d) => (d ? { ...d, kind: v as IncomeSourceKind } : d))
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="passive">Passive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income-name">Name</Label>
              <Input
                id="income-name"
                autoFocus
                required
                value={draft?.name ?? ""}
                onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income-details">Details</Label>
              <Input
                id="income-details"
                value={draft?.details ?? ""}
                onChange={(e) => setDraft((d) => (d ? { ...d, details: e.target.value } : d))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income-icon">Icon name</Label>
              <Input
                id="income-icon"
                value={draft?.icon ?? ""}
                onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
              />
              <p className="text-xs text-muted-foreground">
                Registry key (e.g. work, apartment, savings).
              </p>
            </div>
            <MoneyInput
              label="Monthly amount (₫)"
              value={draft?.monthly ?? 0}
              min={0}
              onChange={(v) => setDraft((d) => (d ? { ...d, monthly: Math.max(0, v) } : d))}
            />
            <div className="flex flex-col gap-1.5">
              <MoneyInput
                label="Capital invested (₫)"
                value={draft?.capital ?? 0}
                min={0}
                onChange={(v) =>
                  setDraft((d) => (d ? { ...d, capital: Math.max(0, v) } : d))
                }
              />
              <p className="text-xs text-muted-foreground">
                Principal you put in to earn this monthly return. Leave at 0 for
                active income (salary, contracts) where no capital is invested.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income-payment-entity">Payment entity (optional)</Label>
              <Input
                id="income-payment-entity"
                value={draft?.paymentEntity ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, paymentEntity: e.target.value } : d))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income-payment-day">Payment day of month (optional)</Label>
              <Input
                id="income-payment-day"
                type="number"
                min={1}
                max={31}
                step={1}
                value={draft?.paymentDay ?? ""}
                onChange={(e) => {
                  const raw = e.target.value === "" ? undefined : Number(e.target.value);
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          paymentDay:
                            raw === undefined || !Number.isFinite(raw)
                              ? undefined
                              : Math.min(31, Math.max(1, Math.round(raw))),
                        }
                      : d,
                  );
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={saveForm} disabled={!draft?.name.trim()}>
              {isCreate ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete income source?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `Remove "${pendingDelete.name}" from your income sources? This cannot be undone.`
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
