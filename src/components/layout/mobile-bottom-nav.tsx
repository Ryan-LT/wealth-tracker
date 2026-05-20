"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { cn } from "@/lib/utils";
import { NAV } from "@/shared/config";

function isActive(activeHref: string, href: string) {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [optimisticActive, setOptimisticActive] = useOptimistic(pathname);

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    if (href === pathname) return;
    startTransition(() => {
      setOptimisticActive(href);
      router.push(href);
    });
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "md:hidden",
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80",
        "pb-[max(env(safe-area-inset-bottom),0.5rem)]",
      )}
    >
      <ul className="mx-auto grid max-w-screen-md grid-cols-5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(optimisticActive, item.href);
          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                onClick={(event) => handleNavigate(event, item.href)}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  "h-14 px-1 pt-1.5 pb-1",
                  "text-[11px] font-medium leading-none",
                  "text-sidebar-foreground/70 transition-colors",
                  "hover:text-sidebar-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset",
                  active && "text-sidebar-primary",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-1/2 top-0 h-[2px] -translate-x-1/2 rounded-full transition-all",
                    active
                      ? "w-10 bg-sidebar-primary"
                      : "w-0 bg-transparent",
                  )}
                />
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                    active && "bg-sidebar-primary/12",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="truncate max-w-full">{item.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
