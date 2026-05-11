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
    href: "/settings",
    label: "Asset configuration",
    short: "Configure",
    icon: "settings",
  },
  {
    href: "/goals",
    label: "Goal Simulator",
    short: "Goals",
    icon: "insights",
  },
];

export const SECONDARY_NAV: NavItem[] = [
  {
    href: "/support",
    label: "Support",
    short: "Support",
    icon: "help_outline",
  },
];
