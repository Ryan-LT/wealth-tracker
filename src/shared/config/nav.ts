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

export type NavItem = {
  href: string;
  label: string;
  /** Label for the mobile tab bar. */
  short: string;
  icon: LucideIcon;
  /** One-line description (command palette, page subtitles). */
  description: string;
  /** Shown in the mobile bottom tab bar. */
  mobileTab?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        short: "Home",
        icon: LayoutDashboard,
        description: "Net worth, cash flow and goal health at a glance",
        mobileTab: true,
      },
    ],
  },
  {
    label: "Planning",
    items: [
      {
        href: "/goals",
        label: "Goals",
        short: "Goals",
        icon: Target,
        description: "Goal plans, projections and checkpoints",
        mobileTab: true,
      },
      {
        href: "/allocations",
        label: "Liquidity",
        short: "Liquidity",
        icon: PieChart,
        description: "How assets are committed across plans",
      },
    ],
  },
  {
    label: "Records",
    items: [
      {
        href: "/assets",
        label: "Assets",
        short: "Assets",
        icon: Landmark,
        description: "Everything you own and how fast you can access it",
        mobileTab: true,
      },
      {
        href: "/income",
        label: "Income & spending",
        short: "Income",
        icon: TrendingUp,
        description: "Income sources and average monthly spending",
      },
      {
        href: "/debts",
        label: "Debts",
        short: "Debts",
        icon: CreditCard,
        description: "Loans, cards and other liabilities",
      },
      {
        href: "/loans",
        label: "Personal loans",
        short: "Loans",
        icon: HandCoins,
        description: "Informal money lent or borrowed",
        mobileTab: true,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/settings",
        label: "Settings",
        short: "Settings",
        icon: Settings,
        description: "Appearance, sync and session",
      },
    ],
  },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

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
