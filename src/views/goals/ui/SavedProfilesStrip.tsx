import { cn } from "@/shared/lib";
import { GOAL_SIMULATOR_NEW_SENTINEL, type GoalProfile } from "@/shared/storage";
import { Button, MaterialIcon } from "@/shared/ui";

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
  const isComposingNew = activeId === GOAL_SIMULATOR_NEW_SENTINEL;

  return (
    <div className="mb-stack-lg flex flex-col gap-stack-sm sm:flex-row sm:items-center sm:gap-stack-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label-sm font-label-sm text-on-surface-variant whitespace-nowrap">
          Saved profiles
        </span>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          startIcon={<MaterialIcon name="add" />}
          disabled={isComposingNew}
          onClick={onNew}
        >
          New goal
        </Button>
      </div>
      <div className="flex min-h-10 flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-1 sm:pb-0">
        {profiles.length === 0 && !isComposingNew ? (
          <p className="text-body-sm font-body-md text-on-surface-variant">
            None yet — fill in the form and save, or start with New goal.
          </p>
        ) : null}
        {profiles.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div
              key={p.id}
              className={cn(
                "flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5",
                isActive
                  ? "bg-surface-container-high"
                  : "bg-surface-container opacity-70",
              )}
            >
              <span className="min-w-0 truncate text-body-md font-medium text-on-surface">
                {p.name}
              </span>
              <button
                type="button"
                onClick={() => onLoad(p.id)}
                className="shrink-0 text-secondary font-label-sm text-label-sm hover:underline"
              >
                Load
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                onClick={() => onDelete(p.id)}
                className="shrink-0 rounded p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-error"
              >
                <MaterialIcon name="delete" />
              </button>
            </div>
          );
        })}
        {isComposingNew ? (
          <span className="rounded-full border border-dashed border-secondary px-3 py-1.5 text-body-sm font-medium text-secondary">
            New goal (unsaved)
          </span>
        ) : null}
      </div>
    </div>
  );
}
