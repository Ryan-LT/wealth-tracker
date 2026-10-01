import type { AllocationsBandFilter, Preferences } from "@/entities/preferences/model";

export const ALLOCATIONS_BAND_FILTERS: { value: AllocationsBandFilter; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "instant", label: "Instant access" },
  { value: "not_instant", label: "Not instant" },
];

export function isAllocationsBandFilter(value: unknown): value is AllocationsBandFilter {
  return value === "both" || value === "instant" || value === "not_instant";
}

export function resolveAllocationsBandFilter(
  prefs: Pick<Preferences, "allocationsBandFilter">,
): AllocationsBandFilter {
  return isAllocationsBandFilter(prefs.allocationsBandFilter) ? prefs.allocationsBandFilter : "both";
}
