export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: string;
};

export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    short: "Home",
    icon: "dashboard",
  },
  {
    href: "/goals",
    label: "Goal Plan",
    short: "Plans",
    icon: "insights",
  },
  {
    href: "/allocations",
    label: "Liquidity & commitments",
    short: "Liquidity",
    icon: "account_balance",
  },
  {
    href: "/settings",
    label: "Asset configuration",
    short: "Configure",
    icon: "settings",
  },
];
