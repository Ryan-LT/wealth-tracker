"use client";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { cn, formatShortDate, formatVnd } from "@/shared/lib";
import { Card } from "@/shared/ui";
import type { ActivityRow } from "@/shared/storage";

type RecentActivityTableProps = {
  rows: ActivityRow[];
};

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <Card>
      <div className="flex items-center justify-between rounded-t-xl border-b border-outline-variant bg-slate-50 px-6 py-4 dark:bg-surface-container-low">
        <h3 className="font-headline-md text-headline-md text-primary">
          Recent Terminal Activity
        </h3>
        <Button variant="text" color="secondary" size="small" sx={{ textTransform: "none" }}>
          View All
        </Button>
      </div>
      <TableContainer component={Paper} elevation={0} className="overflow-x-auto rounded-b-xl">
        <Table size="medium" aria-label="Recent activity">
          <TableHead>
            <TableRow sx={{ borderBottom: "1px solid var(--color-surface-container-highest)" }}>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Asset/Account
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Category
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}
              >
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="font-data-tabular text-data-tabular text-on-surface">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="font-body-md text-body-md text-on-surface-variant py-8">
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:last-child td": { borderBottom: 0 },
                  ...(idx < rows.length - 1 && {
                    "& td": { borderBottom: "1px solid var(--color-surface-container)" },
                  }),
                }}
              >
                <TableCell>{formatShortDate(row.date)}</TableCell>
                <TableCell>{row.asset}</TableCell>
                <TableCell sx={{ color: "var(--color-on-surface-variant)" }}>{row.category}</TableCell>
                <TableCell
                  align="right"
                  className={cn(row.amount > 0 ? "text-secondary" : "text-on-surface")}
                >
                  {formatVnd(row.amount, { showSign: row.amount > 0 })}
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
