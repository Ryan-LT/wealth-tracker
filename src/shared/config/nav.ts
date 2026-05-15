import {
  HandCoins,
  LayoutDashboard,
  PieChart,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    short: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/goals",
    label: "Goal Plan",
    short: "Plans",
    icon: Target,
  },
  {
    href: "/allocations",
    label: "Liquidity & commitments",
    short: "Liquidity",
    icon: PieChart,
  },
  {
    href: "/settings",
    label: "Asset configuration",
    short: "Configure",
    icon: Settings,
  },
  {
    href: "/loans",
    label: "Personal loans",
    short: "Loans",
    icon: HandCoins,
  },
];
