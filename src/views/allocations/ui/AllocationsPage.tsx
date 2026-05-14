"use client";

import { useEffect, useMemo, useState } from "react";

import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  buildGoalStartingOptions,
  cn,
  formatVnd,
  migrateLegacySeedsToLines,
  sanitizeSeedLinesAgainstOptions,
  totalMonthlyIncomeFromSources,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  SETTINGS_ASSETS_SEED,
  type AssetsState,
  type GoalProfile,
  useTable,
} from "@/shared/storage";

import {
  buildAllocationReport,
  type AllocationSourceRow,
  type LiquidityBand,
} from "../lib/computeCrossGoalAllocations";
import {
  cycleMatrixColumnSort,
  readStoredMatrixColumnSort,
  sortIndicator,
  sortMatrixByColumn,
  writeStoredMatrixColumnSort,
  type MatrixColumnClick,
  type MatrixColumnSort,
} from "../lib/matrixColumnSort";

function bandBadgeClass(band: LiquidityBand): string {
  switch (band) {
    case "instant":
      return "bg-secondary-container/80 text-on-background ring-1 ring-inset ring-secondary/45";
    case "not_instant":
      return "bg-tertiary-fixed-dim/80 text-on-background ring-1 ring-inset ring-on-tertiary-fixed-variant/35";
    case "custom":
      return "bg-surface-container-highest text-on-surface ring-1 ring-inset ring-outline-variant";
    default:
      return "bg-surface-container-high text-on-surface ring-1 ring-inset ring-outline-variant";
  }
}

function bandLabel(band: LiquidityBand): string {
  switch (band) {
    case "instant":
      return "Instant access";
    case "not_instant":
      return "Not instant";
    case "custom":
      return "Custom model";
    default:
      return "—";
  }
}

function matrixHeaderButtonClass(align: "start" | "end"): string {
  return cn(
    "-mx-1 flex min-h-10 w-full min-w-0 items-center gap-1 rounded px-1 py-1 font-semibold uppercase tracking-wide text-on-surface-variant transition-colors",
    align === "start" ? "justify-start text-start" : "justify-end text-end",
    "hover:bg-surface-container-highest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
  );
}

function MatrixSortTh({
  sort,
  click,
  onSort,
  align,
  sticky,
  children,
}: {
  sort: MatrixColumnSort;
  click: MatrixColumnClick;
  onSort: () => void;
  align: "start" | "end";
  sticky?: boolean;
  children: React.ReactNode;
}) {
  const ind = sortIndicator(sort, click);
  const ariaSort = ind === "asc" ? "ascending" : ind === "desc" ? "descending" : "none";
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        "px-2 py-2 align-bottom",
        align === "end" && "text-end",
        sticky && "sticky left-0 z-10 min-w-[10rem] border-r border-outline-variant/30 bg-surface-container-low shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]",
      )}
    >
      <button type="button" className={matrixHeaderButtonClass(align)} onClick={onSort}>
        <span className={cn("min-w-0", align === "end" && "line-clamp-2")}>{children}</span>
        {ind ? (
          <span className="shrink-0 font-data-tabular text-data-tabular text-secondary" aria-hidden>
            {ind === "asc" ? "↑" : "↓"}
          </span>
        ) : (
          <span className="shrink-0 font-data-tabular text-data-tabular opacity-0" aria-hidden>
            ↑
          </span>
        )}
      </button>
    </th>
  );
}

function normalizeForReport(
  profiles: GoalProfile[],
  seedKeys: Set<string>,
): GoalProfile[] {
  return profiles
    .filter((p) => p.id)
    .map((p) => ({
      ...p,
      seedLines: sanitizeSeedLinesAgainstOptions(migrateLegacySeedsToLines(p), seedKeys),
    }));
}

function SourceCard({
  row,
  plans,
}: {
  row: AllocationSourceRow;
  plans: { id: string; name: string }[];
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-body-md text-body-md text-on-surface">{row.label}</p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-label-sm font-label-sm",
              bandBadgeClass(row.band),
            )}
          >
            {bandLabel(row.band)}
          </span>
        </div>
        <div className="shrink-0 text-end text-label-sm text-on-surface-variant">
          <div>
            Live <span className="font-data-tabular text-data-tabular">{formatVnd(row.liveBalance)}</span>
          </div>
          <div>
            Reserved{" "}
            <span className="font-data-tabular text-data-tabular">{formatVnd(row.totalReservedStored)}</span>
          </div>
          <div className="text-secondary">
            Uncommitted pool{" "}
            <span className="font-data-tabular text-data-tabular">{formatVnd(row.remainingPool)}</span>
          </div>
        </div>
      </div>
      {plans.length > 0 ? (
        <ul className="mt-2 divide-y divide-outline-variant/50 border-t border-outline-variant/40 pt-2">
          {plans.map((p) => {
            const v = row.perPlanStored[p.id] ?? 0;
            if (v <= 0) return null;
            return (
              <li key={p.id} className="flex justify-between gap-2 py-1.5 text-label-sm">
                <span className="min-w-0 truncate text-on-surface-variant">{p.name}</span>
                <span className="shrink-0 font-data-tabular text-data-tabular text-on-surface">
                  {formatVnd(v)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function AllocationsPage() {
  const [goals] = useTable("goals", GOALS_SEED);
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);

  const [matrixColSort, setMatrixColSort] = useState<MatrixColumnSort>(null);

  useEffect(() => {
    const stored = readStoredMatrixColumnSort();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydrate from sessionStorage after mount
      setMatrixColSort(stored);
    }
  }, []);

  const bumpMatrixSort = (click: MatrixColumnClick) => {
    setMatrixColSort((prev) => {
      const next = cycleMatrixColumnSort(prev, click);
      writeStoredMatrixColumnSort(next);
      return next;
    });
  };

  const seedOptions = useMemo(
    () => buildGoalStartingOptions(assets, settingsAssets),
    [assets, settingsAssets],
  );

  const seedKeySet = useMemo(() => new Set(seedOptions.map((o) => o.key)), [seedOptions]);

  const normalizedProfiles = useMemo(
    () => normalizeForReport(goals.profiles, seedKeySet),
    [goals.profiles, seedKeySet],
  );

  const report = useMemo(
    () => buildAllocationReport(normalizedProfiles, seedOptions, settingsAssets),
    [normalizedProfiles, seedOptions, settingsAssets],
  );

  const incomeMonthly = useMemo(() => totalMonthlyIncomeFromSources(sources), [sources]);

  const plansForCards = useMemo(
    () => report.plans.map((p) => ({ id: p.id, name: p.name })),
    [report.plans],
  );

  const sortedMatrixSources = useMemo(
    () => sortMatrixByColumn(report.sources, matrixColSort),
    [report.sources, matrixColSort],
  );

  return (
    <main className="flex w-full min-w-0 flex-col py-10 max-md:px-margin-mobile md:min-h-screen md:px-stack-lg md:pb-8">
      <header className="mb-stack-md">
        <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-background">
          Liquidity &amp; commitments
        </h2>
        <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
          See how starting-balance lines from{" "}
          <strong className="text-on-surface">Asset configuration</strong> are reserved across your{" "}
          <strong className="text-on-surface">Goal Plan</strong> profiles.{" "}
          <strong className="text-on-surface">Uncommitted pool</strong> is how much more you can still assign from
          that source before you hit the live balance minus other plans&apos; claims. Instant vs not instant follows
          catalog liquidity for settings assets; portfolio cash counts as instant; real estate and listed investments
          are treated as not instant for spendable headroom.
        </p>
      </header>

      <div className="mb-stack-md rounded-lg border border-outline-variant bg-surface-container-low p-4 sm:p-5">
        <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
          Monthly income (settings)
        </p>
        <p className="mt-1 font-data-tabular text-data-tabular text-2xl text-on-surface">
          {formatVnd(incomeMonthly)}
        </p>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Income is not split by source here; each plan can include or exclude it in Goal Plan. Below lists which plans
          currently include monthly income in their projection.
        </p>
      </div>

      {report.plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-8 text-center">
          <p className="font-body-md text-on-surface">No saved goal plans yet.</p>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            Save a plan under Goal Plan to see cross-goal reservations here.
          </p>
        </div>
      ) : (
        <div className="mb-stack-md overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full min-w-[520px] border-collapse text-left text-label-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-on-surface-variant sm:px-4">
                  Plan
                </th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-on-surface-variant sm:px-4">
                  Starting (capped)
                </th>
                <th className="px-3 py-2 font-semibold uppercase tracking-wide text-on-surface-variant sm:px-4">
                  Monthly income in projection
                </th>
              </tr>
            </thead>
            <tbody>
              {report.plans.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/60 odd:bg-surface-container-lowest/40">
                  <td className="px-3 py-2.5 font-body-md text-on-surface sm:px-4">{p.name}</td>
                  <td className="px-3 py-2.5 font-data-tabular text-data-tabular text-on-surface sm:px-4">
                    {formatVnd(p.effectiveStartingTotal)}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-label-sm font-label-sm",
                        p.usesMonthlyIncome
                          ? assetCategoryBadgeClassNames("Cash")
                          : "bg-surface-container-high text-on-surface-variant ring-1 ring-inset ring-outline-variant",
                      )}
                    >
                      {p.usesMonthlyIncome ? `On — ${formatVnd(incomeMonthly)}/mo` : "Off for this plan"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="mb-stack-md">
        <h3 className="mb-3 text-headline-md font-headline-md text-on-surface">Spendable headroom (keyed sources)</h3>
        <div className="grid grid-cols-1 gap-stack-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Instant pool left
            </p>
            <p className="mt-2 font-data-tabular text-data-tabular text-2xl text-secondary">
              {formatVnd(report.totals.instantRemainingPool)}
            </p>
            <p className="mt-2 text-label-sm text-on-surface-variant">
              Sum of uncommitted capacity on sources tagged instant (cash + instant catalog lines).
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Not-instant pool left
            </p>
            <p className="mt-2 font-data-tabular text-data-tabular text-2xl text-on-surface">
              {formatVnd(report.totals.notInstantRemainingPool)}
            </p>
            <p className="mt-2 text-label-sm text-on-surface-variant">
              Capacity still assignable on real estate, investments, and catalog rows marked not instant.
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Custom amounts (modelled)
            </p>
            <p className="mt-2 font-data-tabular text-data-tabular text-2xl text-on-surface">
              {formatVnd(report.totals.customReservedStored)}
            </p>
            <p className="mt-2 text-label-sm text-on-surface-variant">
              Total custom starting lines across plans (not tied to a live catalog balance).
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-headline-md font-headline-md text-on-surface">Source × plan matrix</h3>

        {report.sources.length === 0 ? (
          <p className="mt-2 rounded-md border border-dashed border-outline-variant bg-surface-container-low px-3 py-4 text-center text-label-sm text-on-surface-variant">
            No keyed starting sources with balances or reservations.
          </p>
        ) : (
          <>
            <p className="mt-2 mb-4 max-w-3xl text-label-sm text-on-surface-variant">
              Cells show <strong className="text-on-surface">stored</strong> amounts on each plan. Caps used in
              simulations match Goal Plan (live balance minus overlapping allocations).{" "}
              <strong className="text-on-surface">Click a column header</strong> to sort: first click applies the
              primary order (A–Z for Source, high→low for amounts), second click reverses, third restores instant-access
              default order.
            </p>
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-lg border border-outline-variant">
                <table className="w-full min-w-[640px] border-collapse text-left text-label-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <MatrixSortTh
                        sort={matrixColSort}
                        click={{ type: "source" }}
                        onSort={() => bumpMatrixSort({ type: "source" })}
                        align="start"
                        sticky
                      >
                        Source
                      </MatrixSortTh>
                      {report.plans.map((p) => (
                        <MatrixSortTh
                          key={p.id}
                          sort={matrixColSort}
                          click={{ type: "plan", planId: p.id }}
                          onSort={() => bumpMatrixSort({ type: "plan", planId: p.id })}
                          align="end"
                        >
                          {p.name}
                        </MatrixSortTh>
                      ))}
                      <MatrixSortTh
                        sort={matrixColSort}
                        click={{ type: "reserved" }}
                        onSort={() => bumpMatrixSort({ type: "reserved" })}
                        align="end"
                      >
                        Reserved
                      </MatrixSortTh>
                      <MatrixSortTh
                        sort={matrixColSort}
                        click={{ type: "live" }}
                        onSort={() => bumpMatrixSort({ type: "live" })}
                        align="end"
                      >
                        Live
                      </MatrixSortTh>
                      <MatrixSortTh
                        sort={matrixColSort}
                        click={{ type: "pool" }}
                        onSort={() => bumpMatrixSort({ type: "pool" })}
                        align="end"
                      >
                        Pool left
                      </MatrixSortTh>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMatrixSources.map((row) => (
                      <tr
                        key={row.sourceKey}
                        className="border-b border-outline-variant/60 bg-surface-container-lowest/30"
                      >
                        <td className="sticky left-0 z-10 min-w-0 border-r border-outline-variant/30 bg-surface-container-low px-3 py-2.5 align-top shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]">
                          <div className="font-body-md text-on-surface">{row.label}</div>
                          <span
                            className={cn(
                              "mt-1 inline-block rounded-full px-2 py-0.5 text-label-sm font-label-sm",
                              bandBadgeClass(row.band),
                            )}
                          >
                            {bandLabel(row.band)}
                          </span>
                        </td>
                        {report.plans.map((p) => (
                          <td
                            key={p.id}
                            className="min-w-0 break-all px-2 py-2.5 text-end font-data-tabular text-data-tabular text-on-surface"
                          >
                            {formatVnd(row.perPlanStored[p.id] ?? 0)}
                          </td>
                        ))}
                        <td className="min-w-0 break-all px-2 py-2.5 text-end font-data-tabular text-data-tabular text-secondary">
                          {formatVnd(row.totalReservedStored)}
                        </td>
                        <td className="min-w-0 break-all px-2 py-2.5 text-end font-data-tabular text-data-tabular text-on-surface">
                          {formatVnd(row.liveBalance)}
                        </td>
                        <td className="min-w-0 break-all px-3 py-2.5 text-end font-data-tabular text-data-tabular text-on-surface">
                          {formatVnd(row.remainingPool)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-stack-sm md:hidden">
              {sortedMatrixSources.map((row) => (
                <SourceCard key={row.sourceKey} row={row} plans={plansForCards} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
