import {
  Banknote,
  BarChart3,
  Briefcase,
  Building2,
  CircleHelp,
  CreditCard,
  Gift,
  GraduationCap,
  HandCoins,
  Handshake,
  Home,
  Landmark,
  LineChart,
  PiggyBank,
  Receipt,
  Repeat,
  Store,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { createElement } from "react";

import { cn } from "@/shared/lib/cn";

/**
 * Icon keys stored on income sources (historic Material Symbol names).
 * Unknown keys render a neutral help icon.
 */
const REGISTRY: Record<string, { icon: LucideIcon; label: string }> = {
  work: { icon: Briefcase, label: "Salary / job" },
  business_center: { icon: Briefcase, label: "Business" },
  storefront: { icon: Store, label: "Shop / store" },
  handshake: { icon: Handshake, label: "Partnership" },
  apartment: { icon: Building2, label: "Rental property" },
  home: { icon: Home, label: "Home" },
  account_balance: { icon: Landmark, label: "Bank" },
  savings: { icon: PiggyBank, label: "Savings / interest" },
  account_balance_wallet: { icon: Wallet, label: "Wallet" },
  payments: { icon: Banknote, label: "Cash" },
  trending_up: { icon: TrendingUp, label: "Investments" },
  show_chart: { icon: LineChart, label: "Dividends" },
  insights: { icon: BarChart3, label: "Analytics" },
  currency_exchange: { icon: Repeat, label: "Recurring transfer" },
  receipt_long: { icon: Receipt, label: "Invoices" },
  credit_card: { icon: CreditCard, label: "Card" },
  money_off: { icon: HandCoins, label: "Side income" },
  school: { icon: GraduationCap, label: "Teaching" },
  redeem: { icon: Gift, label: "Gifts / bonus" },
};

export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && REGISTRY[name]?.icon) || CircleHelp;
}

export const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = Object.entries(REGISTRY).map(
  ([value, v]) => ({ value, label: v.label, icon: v.icon }),
);

export function RegistryIcon({ name, className }: { name: string | undefined; className?: string }) {
  return createElement(resolveIcon(name), { className: cn("size-4 shrink-0", className), "aria-hidden": true });
}
