"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Saved plans
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isComposingNew}
          onClick={onNew}
        >
          <Plus className="size-4" />
          New plan
        </Button>
      </div>
      <div className="flex min-h-10 flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-1 sm:pb-0">
        {profiles.length === 0 && !isComposingNew ? (
          <p className="text-xs text-muted-foreground">None saved — use New plan, then Save.</p>
        ) : null}
        {profiles.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div
              key={p.id}
              className={cn(
                "flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5",
                isActive
                  ? "bg-accent border-border"
                  : "bg-muted/30 border-border/60 opacity-70",
              )}
            >
              <span className="min-w-0 truncate text-sm font-medium">{p.name}</span>
              <button
                type="button"
                onClick={() => onLoad(p.id)}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Load
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                onClick={() => onDelete(p.id)}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
        {isComposingNew ? (
          <span className="rounded-full border border-dashed border-primary px-3 py-1.5 text-xs font-medium text-primary">
            New plan (unsaved)
          </span>
        ) : null}
      </div>
    </div>
  );
}
