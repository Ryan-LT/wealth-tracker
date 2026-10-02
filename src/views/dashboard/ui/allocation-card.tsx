"use client";

import { useState } from "react";

import type { CategoryTotal } from "@/entities/portfolio";
import { assetCategoryLabel, resolveAssetCategoryEmoji } from "@/entities/settings-asset";
import { useI18n } from "@/shared/i18n";
import { formatPercent } from "@/shared/lib/format";
import { BarList } from "@/shared/ui/bar-list";
import { ChartViewToggle, type ChartView } from "@/shared/ui/chart";
import { EmptyState } from "@/shared/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

export function AllocationCard({ rows }: { rows: CategoryTotal[] }) {
  const [view, setView] = useState<ChartView>("chart");
  const { t } = useI18n();
  const m = t.dashboard.allocation;
  return (
    <Section
      title={m.title}
      description={m.description}
      actions={rows.length ? <ChartViewToggle value={view} onChange={setView} /> : null}
    >
      {rows.length === 0 ? (
        <EmptyState title={m.emptyTitle} description={m.emptyDescription} className="py-6" />
      ) : view === "chart" ? (
        <BarList
          items={rows.map((r) => ({
            key: r.category,
            label: (
              <span className="flex items-center gap-2">
                <span aria-hidden>{resolveAssetCategoryEmoji(r.category)}</span>
                {assetCategoryLabel(r.category)}
              </span>
            ),
            value: r.value,
            valueLabel: <Money value={r.value} compact />,
            share: r.share,
          }))}
        />
      ) : (
        <Table containerClassName="-mx-5 w-auto">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{m.category}</TableHead>
              <TableHead className="text-right">{m.assets}</TableHead>
              <TableHead className="text-right">{m.value}</TableHead>
              <TableHead className="text-right">{m.share}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.category}>
                <TableCell>{assetCategoryLabel(r.category)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                <TableCell className="text-right">
                  <Money value={r.value} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(r.share * 100)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
