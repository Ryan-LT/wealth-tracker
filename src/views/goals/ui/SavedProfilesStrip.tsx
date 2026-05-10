import { cn } from "@/shared/lib";
import type { GoalProfile } from "@/shared/storage";

type SavedProfilesStripProps = {
  profiles: GoalProfile[];
  activeId: string;
  onLoad: (id: string) => void;
};

export function SavedProfilesStrip({
  profiles,
  activeId,
  onLoad,
}: SavedProfilesStripProps) {
  return (
    <div className="mb-stack-lg flex items-center gap-stack-md overflow-x-auto pb-2 scrollbar-hide">
      <span className="text-label-sm font-label-sm text-on-surface-variant whitespace-nowrap">
        Saved Profiles:
      </span>
      <div className="flex gap-2">
        {profiles.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant",
                isActive
                  ? "bg-surface-container-high"
                  : "bg-surface-container opacity-70",
              )}
            >
              <span className="text-body-md font-medium text-on-surface">{p.name}</span>
              <button
                type="button"
                onClick={() => onLoad(p.id)}
                className="text-secondary font-label-sm text-label-sm hover:underline"
              >
                Load
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
