"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/widgets/page-header";
import { Main } from "@/widgets/page-shell";
import { ProfileDropdown } from "@/widgets/profile-menu";
import { ThemeSwitch } from "@/widgets/theme-switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { AssetCategoryBadge } from "@/shared/ui";
import {
  buildGoalStartingOptions,
  formatVnd,
  migrateLegacySeedsToLines,
  sanitizeSeedLinesAgainstOptions,
  totalMonthlyIncomeFromSources,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  type AllocationsBandFilter,
  type AssetsState,
  type GoalProfile,
  useHydrated,
  useTable,
} from "@/shared/storage";

import {
  buildAllocationReport,
  type AllocationSourceRow,
  type LiquidityBand,
} from "../lib/compute-cross-goal-allocations";
import {
  cycleMatrixColumnSort,
  readStoredMatrixColumnSort,
  sortIndicator,
  sortMatrixByColumn,
  writeStoredMatrixColumnSort,
  type MatrixColumnClick,
  type MatrixColumnSort,
} from "../lib/matrix-column-sort";

function bandBadgeClass(band: LiquidityBand): string {
  switch (band) {
    case "instant":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30";
    case "not_instant":
      return "bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30";
    case "custom":
      return "bg-muted text-muted-foreground ring-1 ring-inset ring-border";
    default:
      return "bg-muted text-muted-foreground ring-1 ring-inset ring-border";
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
    <TableHead
      aria-sort={ariaSort}
      className={cn(
        "align-bottom",
        align === "end" && "text-end",
        sticky && "sticky left-0 z-10 min-w-[10rem] bg-card",
      )}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "-mx-1 flex w-full min-w-0 items-center gap-1 rounded px-1 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground",
          align === "end" ? "justify-end text-end" : "justify-start text-start",
        )}
      >
        <span className="min-w-0">{children}</span>
        {ind ? (
          <span className="shrink-0 text-primary" aria-hidden>
            {ind === "asc" ? "↑" : "↓"}
          </span>
        ) : null}
      </button>
    </TableHead>
  );
}

function normalizeForReport(profiles: GoalProfile[], seedKeys: Set<string>): GoalProfile[] {
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
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm">{row.label}</p>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                bandBadgeClass(row.band),
              )}
            >
              {bandLabel(row.band)}
            </span>
          </div>
          <div className="shrink-0 text-end text-xs text-muted-foreground">
            <div>
              Live <span className="font-data-tabular tabular-nums">{formatVnd(row.liveBalance)}</span>
            </div>
            <div>
              Reserved{" "}
              <span className="font-data-tabular tabular-nums">{formatVnd(row.totalReservedStored)}</span>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400">
              Uncommitted pool{" "}
              <span className="font-data-tabular tabular-nums">{formatVnd(row.remainingPool)}</span>
            </div>
          </div>
        </div>
        {plans.length > 0 ? (
          <ul className="mt-2 divide-y divide-border/50 border-t pt-2">
            {plans.map((p) => {
              const v = row.perPlanStored[p.id] ?? 0;
              if (v <= 0) return null;
              return (
                <li key={p.id} className="flex justify-between gap-2 py-1.5 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">{p.name}</span>
                  <span className="shrink-0 font-data-tabular tabular-nums">{formatVnd(v)}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

const BAND_FILTER_OPTIONS: { value: AllocationsBandFilter; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "instant", label: "Instant access" },
  { value: "not_instant", label: "Not instant" },
];

function isBandFilter(value: string): value is AllocationsBandFilter {
  return value === "both" || value === "instant" || value === "not_instant";
}

export function AllocationsPage() {
  const hydrated = useHydrated();
  const [goals] = useTable("goals", GOALS_SEED);
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const bandFilter: AllocationsBandFilter = prefs.allocationsBandFilter ?? "both";

  const [matrixColSort, setMatrixColSort] = useState<MatrixColumnSort>(null);

  useEffect(() => {
    const stored = readStoredMatrixColumnSort();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const visibleMatrixSources = useMemo(() => {
    if (bandFilter === "both") return sortedMatrixSources;
    return sortedMatrixSources.filter((row) => row.band === bandFilter);
  }, [sortedMatrixSources, bandFilter]);

  const onBandFilterChange = (value: string) => {
    if (!isBandFilter(value)) return;
    setPrefs((p) => ({ ...p, allocationsBandFilter: value }));
  };

  return (
    <>
      <Header fixed>
        <h1 className="text-lg font-semibold md:text-base md:font-medium">Liquidity & commitments</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4 max-md:hidden">
          <h1 className="text-2xl font-bold tracking-tight">Liquidity & commitments</h1>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly income (settings)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8">
              {hydrated ? formatVnd(incomeMonthly) : <Skeleton className="h-7 w-40 inline-block align-middle" />}
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-4">
              {hydrated
                ? "Plans can include or exclude this in their projection."
                : <Skeleton className="h-3 w-64 inline-block align-middle" />}
            </p>
          </CardContent>
        </Card>

        {!hydrated ? (
          <Card className="mb-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Starting (capped)</TableHead>
                  <TableHead>Monthly income in projection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : report.plans.length === 0 ? (
          <Card className="mb-4">
            <CardContent className="px-4 py-8 text-center">
              <p className="text-sm">No saved goal plans yet.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Save a plan under Goal Plan to see cross-goal reservations here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Starting (capped)</TableHead>
                  <TableHead>Monthly income in projection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-data-tabular tabular-nums">
                      {formatVnd(p.effectiveStartingTotal)}
                    </TableCell>
                    <TableCell>
                      {p.usesMonthlyIncome ? (
                        <AssetCategoryBadge category="Cash" className="text-[10px]">
                          {`On — ${formatVnd(incomeMonthly)}/mo`}
                        </AssetCategoryBadge>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
                          )}
                        >
                          Off for this plan
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <section className="mb-4">
          <h3 className="mb-3 text-base font-semibold">Spendable headroom (keyed sources)</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Instant pool left
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400 leading-8">
                  {hydrated ? formatVnd(report.totals.instantRemainingPool) : <Skeleton className="h-7 w-32 inline-block align-middle" />}
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-4">
                  {hydrated ? "Uncommitted capacity on instant-tagged sources." : <Skeleton className="h-3 w-56 inline-block align-middle" />}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Not-instant pool left
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-data-tabular tabular-nums leading-8">
                  {hydrated ? formatVnd(report.totals.notInstantRemainingPool) : <Skeleton className="h-7 w-32 inline-block align-middle" />}
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-4">
                  {hydrated ? "Real estate, investments, and not-instant catalog rows." : <Skeleton className="h-3 w-56 inline-block align-middle" />}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Custom amounts (modelled)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-data-tabular tabular-nums leading-8">
                  {hydrated ? formatVnd(report.totals.customReservedStored) : <Skeleton className="h-7 w-32 inline-block align-middle" />}
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-4">
                  {hydrated ? "Total custom starting lines (no live balance)." : <Skeleton className="h-3 w-56 inline-block align-middle" />}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Source × plan matrix</h3>
            <Tabs value={bandFilter} onValueChange={onBandFilterChange}>
              <TabsList>
                {BAND_FILTER_OPTIONS.map((opt) => (
                  <TabsTrigger
                    key={opt.value}
                    value={opt.value}
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white dark:data-[state=active]:border-emerald-500"
                  >
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {!hydrated ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="text-end"><Skeleton className="ml-auto h-4 w-16" /></TableHead>
                      <TableHead className="text-end"><Skeleton className="ml-auto h-4 w-16" /></TableHead>
                      <TableHead className="text-end"><Skeleton className="ml-auto h-4 w-16" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-end"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                        <TableCell className="text-end"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                        <TableCell className="text-end"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : report.sources.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No keyed starting sources with balances or reservations.
                </p>
              </CardContent>
            </Card>
          ) : visibleMatrixSources.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No sources match this liquidity filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="mb-3 max-w-3xl text-xs text-muted-foreground">
                Click a column header to sort.
              </p>
              <div className="hidden md:block">
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleMatrixSources.map((row) => (
                          <TableRow key={row.sourceKey}>
                            <TableCell className="sticky left-0 z-10 bg-card align-top">
                              <div className="text-sm">{row.label}</div>
                              <span
                                className={cn(
                                  "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  bandBadgeClass(row.band),
                                )}
                              >
                                {bandLabel(row.band)}
                              </span>
                            </TableCell>
                            {report.plans.map((p) => (
                              <TableCell
                                key={p.id}
                                className="text-end font-data-tabular tabular-nums"
                              >
                                {formatVnd(row.perPlanStored[p.id] ?? 0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-end font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400">
                              {formatVnd(row.totalReservedStored)}
                            </TableCell>
                            <TableCell className="text-end font-data-tabular tabular-nums">
                              {formatVnd(row.liveBalance)}
                            </TableCell>
                            <TableCell className="text-end font-data-tabular tabular-nums">
                              {formatVnd(row.remainingPool)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-3 md:hidden">
                {visibleMatrixSources.map((row) => (
                  <SourceCard key={row.sourceKey} row={row} plans={plansForCards} />
                ))}
              </div>
            </>
          )}
        </section>
      </Main>
    </>
  );
}
