"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "@/shared/config";
import { cn } from "@/shared/lib";
import { MaterialIcon } from "@/shared/ui";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className={cn(
        "fixed bottom-0 w-full md:hidden rounded-t-xl bg-surface-container-lowest",
        "border-t border-outline-variant shadow-lg flex justify-around items-center h-16 px-4 pb-safe z-50",
      )}
    >
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center font-label-sm text-label-sm",
              "active:bg-surface-container-high transition-transform scale-90",
              active
                ? "text-secondary font-bold bg-secondary-container/20 rounded-full px-4 py-1"
                : "text-on-surface-variant",
            )}
          >
            <MaterialIcon name={item.icon} filled={active} size={24} className="mb-1" />
            <span>{item.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
