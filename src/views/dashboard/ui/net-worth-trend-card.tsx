"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { buildNetWorthTrend, type NetWorthMonthSnapshot } from "@/entities/preferences";
import { formatDate, formatMoney, formatMoneyCompact } from "@/shared/lib/format";
import { chartAxisProps, ChartTooltipCard, ChartViewToggle, type ChartView } from "@/shared/ui/chart";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

export function NetWorthTrendCard({ history, netWorth }: { history: NetWorthMonthSnapshot[]; netWorth: number }) {
  const [view, setView] = useState<ChartView>("chart");
  const points = useMemo(() => buildNetWorthTrend(history, netWorth), [history, netWorth]);
  const data = points.map((p) => ({ x: p.date.getTime(), value: p.value, live: p.live }));
  const first = points[0]?.value ?? 0;
  const change = netWorth - first;

  return (
    <Section
      title="Net worth trend"
      description={
        <>
          Last 6 months · <Money value={change} signed tone="auto" compact /> since {formatDate(points[0]?.date, "monthYear")}
        </>
      }
      actions={<ChartViewToggle value={view} onChange={setView} />}
    >
      {view === "chart" ? (
        <div className="h-56 w-full" role="img" aria-label={`Net worth over the last six months, now ${formatMoney(netWorth)}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="x"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                ticks={data.map((d) => d.x)}
                tickFormatter={(x: number) => formatDate(x, "monthYear")}
                {...chartAxisProps}
                tickMargin={8}
              />
              <YAxis
                width={56}
                tickFormatter={(v: number) => formatMoneyCompact(v, { symbol: false })}
                domain={["auto", "auto"]}
                {...chartAxisProps}
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltipCard
                      title={`${formatDate(Number(payload[0].payload.x), "monthYear")}${payload[0].payload.live ? " (today)" : ""}`}
                      rows={[{ key: "nw", name: "Net worth", color: "var(--chart-1)", value: formatMoney(Number(payload[0].value)) }]}
                    />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#nw-fill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Table containerClassName="-mx-5 w-auto">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Net worth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((p) => (
              <TableRow key={p.monthKey}>
                <TableCell>
                  {formatDate(p.date, "monthYear")}
                  {p.live ? <span className="ml-1 text-xs text-muted-foreground">(today)</span> : null}
                </TableCell>
                <TableCell className="text-right">
                  <Money value={p.value} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
