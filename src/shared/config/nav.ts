import {
  CreditCard,
  HandCoins,
  LayoutDashboard,
  Landmark,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import type { Messages } from "@/shared/i18n";

export type NavId = keyof Messages["nav"]["items"];
export type NavGroupId = keyof Messages["nav"]["groups"];
export type QuickActionId = keyof Messages["nav"]["quickAdd"];

/** Labels, short tab labels and descriptions live in `t.nav.items[id]`. */
export type NavItem = {
  id: NavId;
  href: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom tab bar. */
  mobileTab?: boolean;
};

export type NavGroup = { id: NavGroupId; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    items: [
      {
        id: "dashboard",
        href: "/",
        icon: LayoutDashboard,
        mobileTab: true,
      },
    ],
  },
  {
    id: "planning",
    items: [
      {
        id: "goals",
        href: "/goals",
        icon: Target,
        mobileTab: true,
      },
      {
        id: "allocations",
        href: "/allocations",
        icon: PieChart,
      },
    ],
  },
  {
    id: "records",
    items: [
      {
        id: "assets",
        href: "/assets",
        icon: Landmark,
        mobileTab: true,
      },
      {
        id: "income",
        href: "/income",
        icon: TrendingUp,
      },
      {
        id: "debts",
        href: "/debts",
        icon: CreditCard,
      },
      {
        id: "loans",
        href: "/loans",
        icon: HandCoins,
        mobileTab: true,
      },
    ],
  },
  {
    id: "system",
    items: [
      {
        id: "settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Labels and search keywords live in `t.nav.quickAdd[id]`. */
export type QuickAction = {
  id: QuickActionId;
  href: string;
  icon: LucideIcon;
};

/** Create shortcuts: each page opens its create dialog for `?new=1`. */
export const QUICK_ADD: QuickAction[] = [
  { id: "asset", href: "/assets?new=1", icon: Landmark },
  { id: "income", href: "/income?new=1", icon: TrendingUp },
  { id: "debt", href: "/debts?new=1", icon: CreditCard },
  { id: "loan", href: "/loans?new=1", icon: HandCoins },
  { id: "plan", href: "/goals?new=1", icon: Target },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav item (and its group) for a pathname. */
export function findNavItem(pathname: string): { item: NavItem; group: NavGroup } | undefined {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => isNavActive(pathname, i.href));
    if (item) return { item, group };
  }
  return undefined;
}
