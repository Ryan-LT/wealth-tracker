"use client";

import { useEffect, useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MuiButton from "@mui/material/Button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { normalizeStoredCheckpoints } from "@/shared/lib";
import type { GoalCheckpoint, GoalProfile } from "@/shared/storage";
import { Button, IconButton, MoneyInput, MaterialIcon } from "@/shared/ui";

export type CheckpointsModalProps = {
  open: boolean;
  onClose: () => void;
  profile: GoalProfile;
  onApply: (checkpoints: GoalCheckpoint[]) => void;
};

const labelSx = {
  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "var(--color-on-surface-variant)",
  },
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
      setWorking(
        normalizeStoredCheckpoints(profile.checkpoints).map((c) => ({ ...c })),
      );
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle className="font-headline-md text-headline-md text-primary border-b border-outline-variant pb-3">
          Checkpoints
        </DialogTitle>
        <DialogContent className="flex flex-col gap-stack-md mt-4 max-h-[min(70vh,560px)] overflow-y-auto">
          <p className="text-label-sm text-on-surface-variant">
            Enter each payment on its date. Cumulative due on the chart is the sum so far.
          </p>
          {working.length === 0 ? (
            <p className="rounded-md border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-center text-label-sm text-on-surface-variant">
              No rows — add below.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {working.map((cp) => (
                <li
                  key={cp.id}
                  className="flex flex-wrap items-end gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-2"
                >
                  <DatePicker
                    label="By date"
                    value={cp.date ? dayjs(cp.date) : null}
                    onChange={(next) =>
                      patchRow(cp.id, {
                        date:
                          next && next.isValid() ? next.format("YYYY-MM-DD") : "",
                      })
                    }
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { ...labelSx, minWidth: 140, flex: "1 1 8rem" },
                      },
                    }}
                  />
                  <MoneyInput
                    label="Payment (₫)"
                    value={cp.amount}
                    onChange={(amount) => patchRow(cp.id, { amount })}
                    className="min-w-0 flex-1"
                    size="small"
                    sx={labelSx}
                  />
                  <IconButton
                    icon="delete"
                    label="Remove checkpoint"
                    className="shrink-0 text-error"
                    onClick={() => removeRow(cp.id)}
                  />
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            className="self-start"
            startIcon={<MaterialIcon name="add" />}
            onClick={addRow}
          >
            Add checkpoint
          </Button>
        </DialogContent>
        <DialogActions className="border-t border-outline-variant px-4 py-3 gap-2">
          <MuiButton onClick={onClose} color="inherit">
            Cancel
          </MuiButton>
          <MuiButton onClick={handleApply} variant="contained" color="secondary">
            Apply to plan
          </MuiButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
