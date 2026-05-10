import { formatVnd } from "@/shared/lib";
import type { CashAccount } from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";

type CashRowProps = {
  account: CashAccount;
  isLast: boolean;
};

export function CashRow({ account, isLast }: CashRowProps) {
  const yieldClass = account.yieldPct > 0.5 ? "text-secondary" : "text-on-surface-variant";

  return (
    <tr
      className={
        isLast
          ? "hover:bg-surface transition-colors"
          : "border-b border-surface-container-high hover:bg-surface transition-colors"
      }
    >
      <td className="py-4">
        <div className="flex items-center gap-2">
          <MaterialIcon name={account.icon} size={20} className="text-on-surface-variant" />
          <span className="font-medium text-primary">{account.category}</span>
        </div>
      </td>
      <td className="py-4 text-on-surface-variant">{account.details}</td>
      <td className={`py-4 font-data-tabular text-data-tabular text-right ${yieldClass}`}>
        {account.yieldPct.toFixed(2)}%
        {account.yieldIncome
          ? ` (+${formatVnd(account.yieldIncome)}/yr)`
          : ""}
      </td>
      <td className="py-4 font-data-tabular text-data-tabular text-right text-primary font-medium">
        {formatVnd(account.balance)}
      </td>
    </tr>
  );
}
