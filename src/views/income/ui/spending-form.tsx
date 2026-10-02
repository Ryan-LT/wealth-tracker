"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { MoneyInput } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Label } from "@/shared/ui/kit/label";

/** Explicit save (no write per keystroke). */
export function SpendingForm({
  value,
  onSave,
  label = "Average monthly spending",
}: {
  value: number;
  onSave: (amount: number) => void;
  label?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    // Adopt changes that arrive from another device / background sync.
    setSynced(value);
    setDraft(value);
  }
  const dirty = draft !== value;

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty) onSave(draft);
      }}
    >
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="avg-spending">{label}</Label>
        <MoneyInput id="avg-spending" value={draft} onChange={setDraft} min={0} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!dirty}>
          <Check />
          Save
        </Button>
        {dirty ? (
          <Button type="button" variant="ghost" onClick={() => setDraft(value)}>
            Reset
          </Button>
        ) : null}
      </div>
    </form>
  );
}
