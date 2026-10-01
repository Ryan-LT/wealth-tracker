"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";
import { isNavActive, NAV } from "@/shared/config";
import { useSidebar } from "@/shared/ui/kit/sidebar";

const TABS = NAV.filter((i) => i.mobileTab);

/** Docked bottom navigation below `md`; "More" opens the full sidebar sheet. */
export function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const { setOpenMobile, openMobile } = useSidebar();
  const onTab = TABS.some((t) => isNavActive(pathname, t.href));

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {active ? <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" /> : null}
                <item.icon className={cn("size-5", active && "text-primary")} aria-hidden />
                {item.short}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            aria-expanded={openMobile}
            className={cn(
              "relative flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              !onTab ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {!onTab ? <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" /> : null}
            <Menu className={cn("size-5", !onTab && "text-primary")} aria-hidden />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
