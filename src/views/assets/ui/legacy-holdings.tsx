import type { AssetsState } from "@/entities/asset";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";

/** Read-only view of the older portfolio-detail document (still counted in net worth). */
export function LegacyHoldings({ assets }: { assets: AssetsState }) {
  const rows = [
    ...assets.realEstate.map((p) => ({ id: `re:${p.id}`, type: "Real estate", name: p.name, value: p.estValue })),
    ...assets.cashAccounts.map((c) => ({ id: `cash:${c.id}`, type: "Cash", name: c.details?.trim() || c.category || "Cash account", value: c.balance })),
    ...assets.investments.map((i) => ({ id: `inv:${i.id}`, type: "Investment", name: i.name, value: i.value })),
  ];
  if (rows.length === 0) return null;
  return (
    <Section
      title="Imported holdings"
      description="Older portfolio entries. Read-only here — still counted in net worth and available as goal sources."
      flush
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Value</TableHead>
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
