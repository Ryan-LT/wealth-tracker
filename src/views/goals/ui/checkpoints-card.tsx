"use client";

import { CircleCheck, CircleDashed, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  checkpointsWithRunningTotal,
  createCheckpointId,
  normalizeStoredCheckpoints,
  type GoalCheckpoint,
} from "@/entities/goal";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { MoneyInput } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { DatePicker } from "@/shared/ui/kit/date-picker";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Label } from "@/shared/ui/kit/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type CheckpointsCardProps = {
  checkpoints: GoalCheckpoint[];
  onApply: (checkpoints: GoalCheckpoint[]) => Promise<void>;
  onTogglePaid: (id: string, paid: boolean) => Promise<void>;
};

export function CheckpointsCard({ checkpoints, onApply, onTogglePaid }: CheckpointsCardProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; nextPaid: boolean } | null>(null);
  const rows = checkpointsWithRunningTotal(checkpoints);
  const confirmRow = confirm ? rows.find((r) => r.id === confirm.id) : undefined;

  return (
    <Section
      title="Checkpoints"
      description="Installments due on specific dates. The chart sums them into a cumulative line."
      actions={
        <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
          <Pencil />
          Edit
        </Button>
      }
      flush
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No checkpoints set"
          description="Add payment dates if this goal is paid in installments."
          className="py-8"
          action={
            <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
              <Plus />
              Add checkpoints
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead className="text-right max-sm:hidden">Cumulative</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="tabular-nums">{formatDate(r.date)}</TableCell>
                <TableCell className="text-right">
                  <Money value={r.amount} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground max-sm:hidden">
                  <Money value={r.running} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={r.paid ? "text-success hover:text-success" : "text-muted-foreground"}
                    onClick={() => setConfirm({ id: r.id, nextPaid: !r.paid })}
                  >
                    {r.paid ? <CircleCheck /> : <CircleDashed />}
                    {r.paid ? "Paid" : "Unpaid"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CheckpointsDialog open={editorOpen} onOpenChange={setEditorOpen} checkpoints={checkpoints} onApply={onApply} />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        destructive={false}
        confirmLabel={confirm?.nextPaid ? "Mark paid" : "Mark unpaid"}
        title={confirm?.nextPaid ? "Mark checkpoint as paid?" : "Mark checkpoint as unpaid?"}
        description={
          <>
            {confirm?.nextPaid
              ? "This records that this installment has been paid. A marker appears on the projection chart at the cumulative amount after this payment."
              : "This removes the paid marker from the projection chart for this checkpoint."}
            {confirmRow ? (
              <span className="mt-2 block font-medium text-foreground">
                {formatDate(confirmRow.date)} — {formatMoney(confirmRow.amount)}
              </span>
            ) : null}
          </>
        }
        onConfirm={async () => {
          if (confirm) await onTogglePaid(confirm.id, confirm.nextPaid);
        }}
      />
    </Section>
  );
}

function CheckpointsDialog({
  open,
  onOpenChange,
  checkpoints,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkpoints: GoalCheckpoint[];
  onApply: (checkpoints: GoalCheckpoint[]) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <CheckpointsEditor checkpoints={checkpoints} onCancel={() => onOpenChange(false)} onApply={async (next) => {
          await onApply(next);
          onOpenChange(false);
        }} />
      </DialogContent>
    </Dialog>
  );
}

function CheckpointsEditor({
  checkpoints,
  onCancel,
  onApply,
}: {
  checkpoints: GoalCheckpoint[];
  onCancel: () => void;
  onApply: (checkpoints: GoalCheckpoint[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<GoalCheckpoint[]>(() => normalizeStoredCheckpoints(checkpoints).map((c) => ({ ...c })));
  const [busy, setBusy] = useState(false);
  const patch = (id: string, p: Partial<GoalCheckpoint>) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const missingDates = rows.filter((r) => !r.date).length;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Checkpoints</DialogTitle>
        <DialogDescription>Enter each payment on its date. Cumulative due on the chart is the sum so far.</DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-3">
        {rows.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">No rows — add one below.</p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((r, i) => (
              <li key={r.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-md border p-3">
                <div className="grid gap-1.5">
                  <Label>Date</Label>
                  <DatePicker value={r.date} onChange={(date) => patch(r.id, { date })} aria-invalid={!r.date} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`cp-amount-${i}`}>Payment</Label>
                  <MoneyInput id={`cp-amount-${i}`} value={r.amount} onChange={(amount) => patch(r.id, { amount })} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove checkpoint"
                  className="text-muted-foreground hover:text-danger"
                  onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => setRows((prev) => [...prev, { id: createCheckpointId(), date: "", amount: 0 }])}
        >
          <Plus />
          Add checkpoint
        </Button>
        {missingDates > 0 ? <p className="text-xs text-warning">Rows without a date are not saved.</p> : null}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onApply(normalizeStoredCheckpoints(rows));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 className="animate-spin" /> : null}
          Apply to plan
        </Button>
      </DialogFooter>
    </>
  );
}
