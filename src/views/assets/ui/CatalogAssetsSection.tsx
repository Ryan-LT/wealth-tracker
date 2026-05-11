import Link from "next/link";

import { formatThousands, totalSettingsAssetsValue } from "@/shared/lib";
import {
  settingsAssetLiquidityLabel,
  type SettingsAsset,
} from "@/shared/storage";
import { Card, MaterialIcon } from "@/shared/ui";

type CatalogAssetsSectionProps = {
  items: SettingsAsset[];
};

/**
 * Read-only mirror of Settings → Asset Management. Values here are included in
 * net-worth totals together with Real Estate / Cash / Investments on this page.
 */
export function CatalogAssetsSection({ items }: CatalogAssetsSectionProps) {
  const catalogSum = totalSettingsAssetsValue(items);

  return (
    <Card variant="section" className="p-6">
      <div className="mb-6 flex flex-col gap-3 border-b border-surface-container-high pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-headline-md font-headline-md tracking-tight text-primary">
            <MaterialIcon name="inventory_2" className="text-secondary" />
            Asset catalog (Settings)
          </h3>
          <p className="mt-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Managed in Settings → Asset Management
          </p>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            These line items are added to your total assets together with Real Estate, Cash, and
            Investments above. Avoid entering the same holding twice in both places.
          </p>
        </div>
        <Link
          href="/settings"
          className="shrink-0 font-label-sm text-label-sm text-secondary hover:underline"
        >
          Edit in Settings
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant py-2">
          No catalog assets yet. Add them under Settings → Asset Management to include them in net
          worth.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-outline-variant pb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">
                    Name
                  </th>
                  <th className="border-b border-outline-variant pb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">
                    Category
                  </th>
                  <th className="border-b border-outline-variant pb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">
                    Access
                  </th>
                  <th className="border-b border-outline-variant pb-3 text-right font-label-sm text-label-sm uppercase text-on-surface-variant">
                    Value (₫)
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={
                      idx < items.length - 1
                        ? "border-b border-surface-container-high"
                        : undefined
                    }
                  >
                    <td className="py-3 font-body-md text-body-md text-primary">{row.name}</td>
                    <td className="py-3 font-body-md text-body-md text-on-surface-variant">
                      {row.category}
                    </td>
                    <td className="py-3 font-body-md text-body-md text-on-surface-variant">
                      {settingsAssetLiquidityLabel(row.liquidity)}
                    </td>
                    <td className="py-3 text-right font-data-tabular text-data-tabular text-primary">
                      {formatThousands(row.currentValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end border-t border-surface-container-high pt-4">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Catalog subtotal
            </span>
            <span className="ml-4 font-data-tabular text-data-tabular font-semibold text-primary">
              {formatThousands(catalogSum)}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
