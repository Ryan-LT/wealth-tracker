"use client";

import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { PersonalLoan, PersonalLoanDirection } from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

type LoanDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  draft: PersonalLoan | null;
  onChange: (next: PersonalLoan) => void;
  onClose: () => void;
  onSave: () => void;
};

export function LoanDialog({ open, mode, draft, onChange, onClose, onSave }: LoanDialogProps) {
  const safeDraft = draft;

  function patch(partial: Partial<PersonalLoan>) {
    if (!safeDraft) return;
    onChange({ ...safeDraft, ...partial });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Add loan note" : "Edit loan note"}</DialogTitle>
      <DialogContent className="flex flex-col gap-3 pt-1">
        <TextField
          select
          margin="dense"
          label="Direction"
          fullWidth
          value={safeDraft?.direction ?? "lent_out"}
          onChange={(e) =>
            patch({ direction: e.target.value as PersonalLoanDirection })
          }
          helperText="“Owed to you” means you lent the money. “You owe” means you borrowed."
        >
          <MenuItem value="lent_out">Owed to you (you lent it)</MenuItem>
          <MenuItem value="borrowed">You owe (you borrowed)</MenuItem>
        </TextField>
        <TextField
          autoFocus
          margin="dense"
          label="Person"
          placeholder="e.g. Anh Minh, Mom, John"
          fullWidth
          value={safeDraft?.person ?? ""}
          onChange={(e) => patch({ person: e.target.value })}
        />
        <MoneyInput
          margin="dense"
          label="Amount (₫)"
          value={safeDraft?.amount ?? 0}
          min={0}
          onChange={(amount) => patch({ amount })}
        />
        <TextField
          type="date"
          margin="dense"
          label="Date"
          fullWidth
          value={safeDraft?.date ?? ""}
          onChange={(e) => patch({ date: e.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
          helperText="When the loan happened (optional)."
        />
        <TextField
          select
          margin="dense"
          label="Status"
          fullWidth
          value={safeDraft?.status ?? "open"}
          onChange={(e) =>
            patch({ status: e.target.value === "settled" ? "settled" : "open" })
          }
        >
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="settled">Settled</MenuItem>
        </TextField>
        <TextField
          margin="dense"
          label="Note (optional)"
          placeholder="What it was for, expected return, etc."
          fullWidth
          multiline
          minRows={2}
          value={safeDraft?.note ?? ""}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose}>Cancel</MuiButton>
        <MuiButton onClick={onSave} variant="contained">
          {mode === "create" ? "Add" : "Save"}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
