"use client";

import type { AssetsState } from "@/entities/asset";
import { useI18n } from "@/shared/i18n";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

/** Read-only view of the older portfolio-detail document (still counted in net worth). */
export function LegacyHoldings({ assets }: { assets: AssetsState }) {
  const { t } = useI18n();
  const m = t.assets.legacy;
  const rows = [
    ...assets.realEstate.map((p) => ({ id: `re:${p.id}`, type: m.typeRealEstate, name: p.name, value: p.estValue })),
    ...assets.cashAccounts.map((c) => ({ id: `cash:${c.id}`, type: m.typeCash, name: c.details?.trim() || c.category || t.domain.startingOptions.cashFallback, value: c.balance })),
    ...assets.investments.map((i) => ({ id: `inv:${i.id}`, type: m.typeInvestment, name: i.name, value: i.value })),
  ];
  if (rows.length === 0) return null;
  return (
    <Section
      title={m.title}
      description={m.description}
      flush
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{m.colName}</TableHead>
            <TableHead>{m.colType}</TableHead>
            <TableHead className="text-right">{m.colValue}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.type}</TableCell>
              <TableCell className="text-right">
                <Money value={r.value} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}
