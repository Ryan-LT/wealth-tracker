"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { normalizeStoredCheckpoints } from "@/shared/lib";
import type { GoalCheckpoint, GoalProfile } from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

export type CheckpointsModalProps = {
  open: boolean;
  onClose: () => void;
  profile: GoalProfile;
  onApply: (checkpoints: GoalCheckpoint[]) => void;
};

function newCheckpointId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CheckpointsModal({ open, onClose, profile, onApply }: CheckpointsModalProps) {
  const initForOpen = useRef(false);
  const [working, setWorking] = useState<GoalCheckpoint[]>([]);

  useEffect(() => {
    if (!open) {
      initForOpen.current = false;
      return;
    }
    if (!initForOpen.current) {
      initForOpen.current = true;
      setWorking(normalizeStoredCheckpoints(profile.checkpoints).map((c) => ({ ...c })));
    }
  }, [open, profile]);

  function addRow() {
    setWorking((prev) => [...prev, { id: newCheckpointId(), date: "", amount: 0 }]);
  }

  function patchRow(id: string, patch: Partial<GoalCheckpoint>) {
    setWorking((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeRow(id: string) {
    setWorking((prev) => prev.filter((c) => c.id !== id));
  }

  function handleApply() {
    onApply(normalizeStoredCheckpoints(working));
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Checkpoints</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 max-h-[min(70vh,520px)] overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            Enter each payment on its date. Cumulative due on the chart is the sum so far.
          </p>
          {working.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/30 px-2 py-2 text-center text-xs text-muted-foreground">
              No rows — add below.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {working.map((cp) => (
                <li
                  key={cp.id}
                  className="flex flex-wrap items-end gap-2 rounded-md border p-2"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      By date
                    </Label>
                    <DatePicker
                      value={cp.date || ""}
                      onChange={(date) => patchRow(cp.id, { date })}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <MoneyInput
                      label="Payment (₫)"
                      value={cp.amount}
                      onChange={(amount) => patchRow(cp.id, { amount })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove checkpoint"
                    className="shrink-0 text-destructive"
                    onClick={() => removeRow(cp.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={addRow}
          >
            <Plus className="size-4" />
            Add checkpoint
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply to plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
