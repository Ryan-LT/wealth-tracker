import type { AllocationSourceRow, LiquidityBand } from "./compute-cross-goal-allocations";

/** Column-driven sort; `null` = instant access first, then A–Z within band. */
export type MatrixColumnSort =
  | null
  | { kind: "source"; dir: "asc" | "desc" }
  | { kind: "reserved"; dir: "asc" | "desc" }
  | { kind: "live"; dir: "asc" | "desc" }
  | { kind: "pool"; dir: "asc" | "desc" }
  | { kind: "plan"; planId: string; dir: "asc" | "desc" };

export const MATRIX_COLUMN_SORT_STORAGE_KEY = "wealthtracker-allocations-matrix-col-sort";

export type MatrixColumnClick =
  | { type: "source" }
  | { type: "reserved" }
  | { type: "live" }
  | { type: "pool" }
  | { type: "plan"; planId: string };

function bandRankInstantFirst(band: LiquidityBand): number {
  switch (band) {
    case "instant":
      return 0;
    case "not_instant":
      return 1;
    case "custom":
      return 2;
    default:
      return 3;
  }
}

function cmpLabel(a: AllocationSourceRow, b: AllocationSourceRow): number {
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
}

function sortInstantFirstThenLabel(rows: AllocationSourceRow[]): AllocationSourceRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    const br = bandRankInstantFirst(a.band) - bandRankInstantFirst(b.band);
    if (br !== 0) return br;
    return cmpLabel(a, b);
  });
  return copy;
}

function firstDir(click: MatrixColumnClick): "asc" | "desc" {
  return click.type === "source" ? "asc" : "desc";
}

function sortMatchesClick(sort: MatrixColumnSort, click: MatrixColumnClick): boolean {
  if (!sort) return false;
  if (click.type === "plan") return sort.kind === "plan" && sort.planId === click.planId;
  return sort.kind === click.type;
}

/**
 * Three-step cycle per column: first click applies primary direction, second toggles, third clears to default.
 */
export function cycleMatrixColumnSort(prev: MatrixColumnSort, click: MatrixColumnClick): MatrixColumnSort {
  const prefer = firstDir(click);
  if (!prev || !sortMatchesClick(prev, click)) {
    return click.type === "plan"
      ? { kind: "plan", planId: click.planId, dir: prefer }
      : { kind: click.type, dir: prefer };
  }
  if (prev.dir === prefer) {
    return click.type === "plan"
      ? { kind: "plan", planId: click.planId, dir: prefer === "desc" ? "asc" : "desc" }
      : { kind: click.type, dir: prefer === "desc" ? "asc" : "desc" };
  }
  return null;
}

function tieBreak(a: AllocationSourceRow, b: AllocationSourceRow): number {
  return cmpLabel(a, b);
}

/**
 * Sort matrix rows. `null` uses instant-access band order, then source name A–Z.
 */
export function sortMatrixByColumn(rows: AllocationSourceRow[], sort: MatrixColumnSort): AllocationSourceRow[] {
  if (sort == null) {
    return sortInstantFirstThenLabel(rows);
  }
  const copy = [...rows];
  const factor = sort.dir === "asc" ? 1 : -1;
  switch (sort.kind) {
    case "source":
      copy.sort((a, b) => {
        const n = factor * cmpLabel(a, b);
        if (n !== 0) return n;
        return tieBreak(a, b);
      });
      break;
    case "reserved":
      copy.sort((a, b) => {
        const n = factor * (a.totalReservedStored - b.totalReservedStored);
        if (n !== 0) return n;
        return tieBreak(a, b);
      });
      break;
    case "live":
      copy.sort((a, b) => {
        const n = factor * (a.liveBalance - b.liveBalance);
        if (n !== 0) return n;
        return tieBreak(a, b);
      });
      break;
    case "pool":
      copy.sort((a, b) => {
        const n = factor * (a.remainingPool - b.remainingPool);
        if (n !== 0) return n;
        return tieBreak(a, b);
      });
      break;
    case "plan": {
      const id = sort.planId;
      copy.sort((a, b) => {
        const va = a.perPlanStored[id] ?? 0;
        const vb = b.perPlanStored[id] ?? 0;
        const n = factor * (va - vb);
        if (n !== 0) return n;
        return tieBreak(a, b);
      });
      break;
    }
    default:
      return sortInstantFirstThenLabel(rows);
  }
  return copy;
}

export function readStoredMatrixColumnSort(): MatrixColumnSort | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(MATRIX_COLUMN_SORT_STORAGE_KEY);
    if (!raw || raw === "null") return null;
    const v = JSON.parse(raw) as MatrixColumnSort;
    if (v == null) return null;
    if (v.kind === "source" || v.kind === "reserved" || v.kind === "live" || v.kind === "pool") {
      if (v.dir === "asc" || v.dir === "desc") return v;
      return null;
    }
    if (v.kind === "plan" && typeof v.planId === "string" && (v.dir === "asc" || v.dir === "desc")) {
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredMatrixColumnSort(sort: MatrixColumnSort): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MATRIX_COLUMN_SORT_STORAGE_KEY, JSON.stringify(sort));
  } catch {
    /* ignore */
  }
}

export function sortIndicator(sort: MatrixColumnSort, click: MatrixColumnClick): "asc" | "desc" | null {
  if (!sort || !sortMatchesClick(sort, click)) return null;
  return sort.dir;
}
