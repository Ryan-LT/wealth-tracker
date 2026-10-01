"use client";

import { Clock, PencilRuler, ShoppingCart, Target, TrendingUp, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ASSETS_SEED, type AssetsState } from "@/entities/asset";
import { GOALS_SEED } from "@/entities/goal";
import { INCOME_SOURCES_SEED } from "@/entities/income";
import { buildAllocationReportForTables, filterAllocationRowsByBand, summarizeCashflow } from "@/entities/portfolio";
import {
  ALLOCATIONS_BAND_FILTERS,
  PREFERENCES_SEED,
  resolveAllocationsBandFilter,
  type AllocationsBandFilter,
} from "@/entities/preferences";
import { SETTINGS_ASSETS_SEED } from "@/entities/settings-asset";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import { useTable } from "@/shared/storage";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/kit/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { Money } from "@/shared/ui/money";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { StatCard, StatGrid } from "@/shared/ui/stat-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageContainer } from "@/widgets/app-shell";

import { cycleMatrixColumnSort, normalizeMatrixColumnSort, sortMatrixByColumn } from "../lib/matrix-column-sort";
import { SourceItem, SourceMatrix } from "./source-matrix";

export function AllocationsPage() {
  const [goals] = useTable("goals", GOALS_SEED);
  const [assets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [incomeSources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);
  const compact = useMediaQuery("(max-width: 1023px)");

  const report = useMemo(
    () => buildAllocationReportForTables({ goals, assets, settingsAssets, incomeSources }),
    [goals, assets, settingsAssets, incomeSources],
  );
  const cash = summarizeCashflow(prefs, incomeSources);
  const band = resolveAllocationsBandFilter(prefs);
  const sort = useMemo(() => normalizeMatrixColumnSort(prefs.allocationsMatrixColumnSort), [prefs.allocationsMatrixColumnSort]);
  const rows = useMemo(
    () => filterAllocationRowsByBand(sortMatrixByColumn(report.sources, sort), band),
    [report.sources, sort, band],
  );

  return (
    <PageContainer>
      <PageHeader title="Liquidity" description="How your assets are committed across goal plans and income capital." />

      <StatGrid className="xl:grid-cols-3">
        <StatCard label="Monthly income" icon={TrendingUp} value={<Money value={cash.totalIncome} compact />} href="/income" />
        <StatCard label="Avg monthly spending" icon={ShoppingCart} value={<Money value={cash.averageSpending} compact />} href="/income" />
        <StatCard
          label="Monthly net savings"
          icon={Wallet}
          value={<Money value={cash.monthlyNet} compact signed tone="auto" />}
          hint="Used when a plan includes monthly income"
        />
        <StatCard
          label="Instant pool left"
          icon={Zap}
          value={<Money value={report.totals.instantRemainingPool} compact />}
          hint="Uncommitted capacity on instant-access sources"
        />
        <StatCard
          label="Not-instant pool left"
          icon={Clock}
          value={<Money value={report.totals.notInstantRemainingPool} compact />}
          hint="Real estate, investments, locked assets"
        />
        <StatCard
          label="Custom amounts"
          icon={PencilRuler}
          value={<Money value={report.totals.customReservedStored} compact />}
          hint="Modelled starting lines with no live balance"
        />
      </StatGrid>

      <Section title="Plans" description="Starting balances after caps, and whether monthly income feeds each projection." flush>
        {report.plans.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No saved goal plans yet"
            description="Save a plan to see how it reserves your assets."
            action={
              <Button variant="outline" asChild>
                <Link href="/goals">Go to goals</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Starting (capped)</TableHead>
                <TableHead className="max-sm:hidden">Monthly income</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-48 truncate font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">
                    <Money value={p.effectiveStartingTotal} />
                  </TableCell>
                  <TableCell className="max-sm:hidden">
                    {p.usesMonthlyIncome ? (
                      <StatusBadge tone="success" dot>
                        On · <Money value={cash.monthlyNet} compact signed />
                        /mo
                      </StatusBadge>
                    ) : (
                      <StatusBadge dot>Off for this plan</StatusBadge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Section
        title="Source × plan matrix"
        description="What each plan reserves from each source, and what is still uncommitted."
        actions={
          <SegmentedControl<AllocationsBandFilter>
            aria-label="Liquidity filter"
            value={band}
            onValueChange={(v) => setPrefs((p) => ({ ...p, allocationsBandFilter: v }))}
            options={ALLOCATIONS_BAND_FILTERS.map((o) => ({
              ...o,
              label: o.value === "both" ? "All" : o.value === "instant" ? "Instant" : "Not instant",
            }))}
          />
        }
        flush
      >
        {report.sources.length === 0 ? (
          <EmptyState title="Nothing to show yet" description="No sources with balances or reservations." />
        ) : rows.length === 0 ? (
          <EmptyState title="No sources match this liquidity filter" />
        ) : compact ? (
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.sourceKey}>
                <SourceItem row={row} plans={report.plans} />
              </li>
            ))}
          </ul>
        ) : (
          <SourceMatrix
            rows={rows}
            plans={report.plans}
            sort={sort}
            onSort={(click) => setPrefs((p) => ({ ...p, allocationsMatrixColumnSort: cycleMatrixColumnSort(sort, click) }))}
          />
        )}
      </Section>
    </PageContainer>
  );
}
