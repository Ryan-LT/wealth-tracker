import { cn, formatShortDate, formatVnd } from "@/shared/lib";
import { Card } from "@/shared/ui";
import type { ActivityRow } from "@/shared/storage";

type RecentActivityTableProps = {
  rows: ActivityRow[];
};

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <Card>
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center rounded-t-xl">
        <h3 className="font-headline-md text-headline-md text-primary">
          Recent Terminal Activity
        </h3>
        <button
          type="button"
          className="font-label-sm text-label-sm text-secondary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest">
              <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 uppercase">
                Date
              </th>
              <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 uppercase">
                Asset/Account
              </th>
              <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 uppercase">
                Category
              </th>
              <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 uppercase text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular text-on-surface">
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  "hover:bg-surface-container-lowest/50 transition-colors",
                  idx < rows.length - 1 && "border-b border-surface-container",
                )}
              >
                <td className="px-6 py-4">{formatShortDate(row.date)}</td>
                <td className="px-6 py-4">{row.asset}</td>
                <td className="px-6 py-4 text-on-surface-variant">{row.category}</td>
                <td
                  className={cn(
                    "px-6 py-4 text-right",
                    row.amount > 0 ? "text-secondary" : "text-on-surface",
                  )}
                >
                  {formatVnd(row.amount, { showSign: row.amount > 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
