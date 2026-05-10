"use client";

import { formatThousands } from "@/shared/lib";
import type { SettingsAsset } from "@/shared/storage";
import { Button, MaterialIcon } from "@/shared/ui";

type AssetManagementTableProps = {
  assets: SettingsAsset[];
  onDelete: (id: string) => void;
  onAdd: () => void;
};

export function AssetManagementTable({
  assets,
  onDelete,
  onAdd,
}: AssetManagementTableProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="account_balance" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Asset Management</h2>
        </div>
        <Button onClick={onAdd}>Add Asset</Button>
      </div>
      <div className="p-stack-md overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant">
                Asset Name
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant">
                Category
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant text-right">
                Current Value (₫)
              </th>
              <th className="pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-outline-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr
                key={asset.id}
                className={
                  idx === assets.length - 1
                    ? "hover:bg-surface-container-low transition-colors"
                    : "border-b border-surface-variant hover:bg-surface-container-low transition-colors"
                }
              >
                <td className="py-4 font-body-md text-body-md text-primary">{asset.name}</td>
                <td className="py-4 font-body-md text-body-md text-on-surface-variant">
                  {asset.category}
                </td>
                <td className="py-4 font-data-tabular text-data-tabular text-primary text-right">
                  {formatThousands(asset.currentValue)}
                </td>
                <td className="py-4 text-right">
                  <button
                    type="button"
                    aria-label={`Edit ${asset.name}`}
                    className="text-on-surface-variant hover:text-secondary transition-colors mr-2"
                  >
                    <MaterialIcon name="edit" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${asset.name}`}
                    onClick={() => onDelete(asset.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
