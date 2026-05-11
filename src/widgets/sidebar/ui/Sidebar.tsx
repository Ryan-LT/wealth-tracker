"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV, SECONDARY_NAV } from "@/shared/config";
import { cn } from "@/shared/lib";
import { MaterialIcon, WealthTrackerLogo } from "@/shared/ui";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="hidden md:flex bg-tertiary-container w-sidebar-width h-screen fixed left-0 top-0 border-r border-outline-variant flex-col py-stack-lg z-50">
      <div className="px-gutter mb-stack-lg flex items-center gap-stack-sm">
        <WealthTrackerLogo size={36} decorative />
        <div>
          <h1 className="text-headline-md font-headline-md text-on-tertiary tracking-tight">
            WealthTracker
          </h1>
          <p className="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider">
            Private Terminal
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-stack-xs px-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-stack-md px-4 py-3 transition-colors",
                "font-body-md text-body-md",
                active
                  ? "text-on-tertiary font-bold border-l-4 border-secondary bg-surface-container-highest/10"
                  : "text-on-tertiary-container hover:text-on-tertiary hover:bg-surface-container-highest/10",
              )}
            >
              <MaterialIcon name={item.icon} filled={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 flex flex-col gap-stack-xs border-t border-outline-variant/30 pt-stack-sm">
        {SECONDARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-stack-md px-4 py-2 transition-colors font-body-md text-body-md",
                active
                  ? "text-on-tertiary font-bold"
                  : "text-on-tertiary-container hover:text-on-tertiary",
              )}
            >
              <MaterialIcon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
