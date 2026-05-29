"use client";

import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type SectionEditActionsProps = {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
};

/** Pen toggles section edit; check and cancel sit in the same header slot. */
export function SectionEditActions({
  editing,
  onEdit,
  onSave,
  onCancel,
  saveLabel = "Save section",
}: SectionEditActionsProps) {
  if (editing) {
    return (
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-emerald-600 hover:text-emerald-600 dark:text-emerald-400"
          aria-label={saveLabel}
          onClick={onSave}
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Cancel"
          onClick={onCancel}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      aria-label="Edit section"
      onClick={onEdit}
    >
      <Pencil className="size-4" />
    </Button>
  );
}
