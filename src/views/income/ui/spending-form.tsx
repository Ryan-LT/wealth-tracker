"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { MoneyInput } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Label } from "@/shared/ui/kit/label";

/** Explicit save (no write per keystroke). */
export function SpendingForm({ value, onSave }: { value: number; onSave: (amount: number) => void }) {
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
      <div className="grid flex-1 gap-1.5 sm:max-w-xs">
        <Label htmlFor="avg-spending">Average monthly spending</Label>
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
