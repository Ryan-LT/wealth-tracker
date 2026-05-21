"use client";

import { Plus, Trash2 } from "lucide-react";
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
import { cn } from "@/shared/lib";
import { GOAL_PLAN_NEW_SENTINEL, type GoalProfile } from "@/shared/storage";

type SavedProfilesStripProps = {
  profiles: GoalProfile[];
  activeId: string;
  onLoad: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function SavedProfilesStrip({
  profiles,
  activeId,
  onLoad,
  onNew,
  onDelete,
}: SavedProfilesStripProps) {
  const isComposingNew = activeId === GOAL_PLAN_NEW_SENTINEL;
  const [pendingDelete, setPendingDelete] = useState<GoalProfile | null>(null);

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Saved plans
          </span>
        </div>
        <div className="flex min-h-10 flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-1 sm:pb-0">
          {profiles.length === 0 && !isComposingNew ? (
            <p className="text-xs text-muted-foreground">
              None saved — use New plan, then Save.
            </p>
          ) : null}
          {profiles.map((p) => {
            const isActive = p.id === activeId;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={isActive ? -1 : 0}
                aria-pressed={isActive}
                aria-label={isActive ? `${p.name} (loaded)` : `Load ${p.name}`}
                onClick={() => {
                  if (!isActive) onLoad(p.id);
                }}
                onKeyDown={(e) => {
                  if (isActive) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onLoad(p.id);
                  }
                }}
                className={cn(
                  "flex max-w-full items-center gap-1.5 rounded-full border pl-3 pr-1 py-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 border-primary/40 text-foreground cursor-default"
                    : "bg-card border-border text-muted-foreground cursor-pointer hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="min-w-0 truncate text-sm font-medium">
                  {p.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${p.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(p);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          })}
          {isComposingNew ? (
            <span className="rounded-full border border-dashed border-primary px-3 py-1.5 text-xs font-medium text-primary">
              New plan (unsaved)
            </span>
          ) : null}
          <Button
            type="button"
            className="rounded-full size-[38px]"
            disabled={isComposingNew}
            onClick={onNew}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.name}" will be removed permanently. This cannot be undone.`
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
    </>
  );
}
