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
    href: "/assets",
    label: "Tracker",
    short: "Assets",
    icon: "account_balance",
  },
  {
    href: "/goals",
    label: "Goal Simulator",
    short: "Goals",
    icon: "insights",
  },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", short: "Settings", icon: "settings" },
  {
    href: "/support",
    label: "Support",
    short: "Support",
    icon: "help_outline",
  },
];
