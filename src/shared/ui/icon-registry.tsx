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

import { activeMessages } from "@/shared/i18n/active";
import type { Messages } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";

type IconKey = keyof Messages["shell"]["incomeIcons"];

/**
 * Icon keys stored on income sources (historic Material Symbol names).
 * Unknown keys render a neutral help icon. Labels live in `shell.incomeIcons`.
 */
const REGISTRY: Record<IconKey, LucideIcon> = {
  work: Briefcase,
  business_center: Briefcase,
  storefront: Store,
  handshake: Handshake,
  apartment: Building2,
  home: Home,
  account_balance: Landmark,
  savings: PiggyBank,
  account_balance_wallet: Wallet,
  payments: Banknote,
  trending_up: TrendingUp,
  show_chart: LineChart,
  insights: BarChart3,
  currency_exchange: Repeat,
  receipt_long: Receipt,
  credit_card: CreditCard,
  money_off: HandCoins,
  school: GraduationCap,
  redeem: Gift,
};

function isIconKey(name: string): name is IconKey {
  return Object.hasOwn(REGISTRY, name);
}

export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && isIconKey(name) && REGISTRY[name]) || CircleHelp;
}

export const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = (Object.keys(REGISTRY) as IconKey[]).map(
  (value) => ({
    value,
    icon: REGISTRY[value],
    /** Read when rendered: the page's language is set after this module loads. */
    get label() {
      return activeMessages().shell.incomeIcons[value];
    },
  }),
);

export function RegistryIcon({ name, className }: { name: string | undefined; className?: string }) {
  return createElement(resolveIcon(name), { className: cn("size-4 shrink-0", className), "aria-hidden": true });
}
