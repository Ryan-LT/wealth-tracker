"use client";

import { Coins, Receipt } from "lucide-react";
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
import type { AssetsState } from "@/entities/asset";
import type { GoalSeedLine } from "@/entities/goal";
import {
  totalCapitalAmount,
  wrapIncomeSourceAsProfile,
  type IncomeSource,
  type IncomeSourceKind,
} from "@/entities/income";
import type { SettingsAsset } from "@/entities/settings-asset";
import { buildGoalStartingOptions, formatVnd } from "@/shared/lib";
import { MoneyInput } from "@/shared/ui";
import { StartingBalancesModal } from "@/views/goals/ui/starting-balances-modal";

import { IncomeSourceCard, IncomeSourceCardSkeleton } from "./income-source-card";

function newIncomeSourceDraft(): IncomeSource {
  return {
    id: `income-${Date.now()}`,
    kind: "active",
    name: "",
    details: "",
    icon: "work",
    monthly: 0,
    capitalLines: [],
  };
}

type IncomeSourcesGridProps = {
  sources: IncomeSource[];
  /** Detailed-tracker asset state (Dashboard cash/real-estate/investments). */
  assets: AssetsState;
  /** Settings → Asset Management catalog rows. */
  settingsAssets: SettingsAsset[];
  onCreate: (source: IncomeSource) => void;
  onUpdate: (source: IncomeSource) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

export function IncomeSourcesGrid({
  sources,
  assets,
  settingsAssets,
  onCreate,
  onUpdate,
  onDelete,
  loading = false,
}: IncomeSourcesGridProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [draft, setDraft] = useState<IncomeSource | null>(null);

  const [capitalModalOpen, setCapitalModalOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IncomeSource | null>(null);

  /** Asset pool options used by the capital allocator modal. */
  const seedOptions = useMemo(
    () => buildGoalStartingOptions(assets, settingsAssets),
    [assets, settingsAssets],
  );

  /** Other income sources, wrapped as profiles so the modal subtracts their
   *  capital reservations when sizing capacity for the source being edited. */
  const otherIncomeAsPlans = useMemo(() => {
    if (!draft) return [];
    return sources
      .filter((s) => s.id !== draft.id)
      .map(wrapIncomeSourceAsProfile);
  }, [sources, draft]);

  const draftAsProfile = useMemo(
    () => (draft ? wrapIncomeSourceAsProfile(draft) : null),
    [draft],
  );

  const draftCapitalTotal = totalCapitalAmount(draft?.capitalLines);

  function openCreate() {
    setIsCreate(true);
    setDraft(newIncomeSourceDraft());
    setFormOpen(true);
  }

  function openEdit(source: IncomeSource) {
    setIsCreate(false);
    setDraft({ ...source, capitalLines: [...(source.capitalLines ?? [])] });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setDraft(null);
    setCapitalModalOpen(false);
  }

  function applyCapitalLines(lines: GoalSeedLine[]) {
    setDraft((d) => (d ? { ...d, capitalLines: lines } : d));
    setCapitalModalOpen(false);
  }

  function saveForm() {
    if (!draft?.id || !draft.name.trim()) return;
    const cleanLines = (draft.capitalLines ?? []).filter(
      (l) => Number.isFinite(l.amount) && l.amount > 0,
    );
    const normalized: IncomeSource = {
      ...draft,
      name: draft.name.trim(),
      details: draft.details.trim(),
      monthly: Number.isFinite(draft.monthly) ? Math.max(0, draft.monthly) : 0,
      capitalLines: cleanLines.length > 0 ? cleanLines : undefined,
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
    <Card variant="secondary">
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
              <Label>Capital invested</Label>
              <Button
                type="button"
                variant="outline"
                className="justify-between gap-2"
                onClick={() => setCapitalModalOpen(true)}
              >
                <span className="inline-flex items-center gap-2">
                  <Coins className="size-4 text-muted-foreground" />
                  {draftCapitalTotal > 0
                    ? `${formatVnd(draftCapitalTotal)} from ${draft?.capitalLines?.length ?? 0} source${(draft?.capitalLines?.length ?? 0) === 1 ? "" : "s"}`
                    : "Set capital sources"}
                </span>
                <span className="text-xs text-muted-foreground">Edit</span>
              </Button>
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

      {draftAsProfile ? (
        <StartingBalancesModal
          open={capitalModalOpen}
          onClose={() => setCapitalModalOpen(false)}
          profile={draftAsProfile}
          savedPlans={otherIncomeAsPlans}
          seedOptions={seedOptions}
          onApply={applyCapitalLines}
        />
      ) : null}

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
