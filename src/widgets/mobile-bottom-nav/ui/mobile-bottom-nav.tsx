"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { cn } from "@/shared/lib";
import { NAV } from "@/shared/config";

const FAB_HREF = "/goals";

function isActive(activeHref: string, href: string) {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [optimisticActive, setOptimisticActive] = useOptimistic(pathname);

  const leftNav = NAV.slice(0, 2);
  const rightNav = NAV.slice(2);

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

  const renderNavItem = (item: (typeof NAV)[number]) => {
    const Icon = item.icon;
    const active = isActive(optimisticActive, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(event) => handleNavigate(event, item.href)}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        title={item.label}
        className={cn(
          "group flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2",
          "transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          key={active ? "on" : "off"}
          className={cn(
            "inline-flex items-center justify-center",
            active && "animate-nav-pop",
          )}
        >
          <Icon className="size-[22px] stroke-[1.75]" />
        </span>
        <span className="max-w-full truncate text-[10px] font-medium leading-none">
          {item.short}
        </span>
      </Link>
    );
  };

  const fabActive = isActive(optimisticActive, FAB_HREF);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto relative",
          "rounded-t-3xl bg-card shadow-[0_-6px_32px_-8px_oklch(0.25_0.04_265_/_12%)]",
          "border-t border-border/30",
          "px-3 pt-2",
          "pb-[max(0.625rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex items-end justify-between">
          <div className="flex min-w-0 flex-1 justify-around">
            {leftNav.map(renderNavItem)}
          </div>

          <div className="relative flex w-16 shrink-0 justify-center">
            <Link
              href={FAB_HREF}
              onClick={(event) => handleNavigate(event, FAB_HREF)}
              aria-current={fabActive ? "page" : undefined}
              aria-label="Goal Plan"
              title="Goal Plan"
              className={cn(
                "absolute -top-7 inline-flex size-14 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground",
                "shadow-[var(--shadow-fab)]",
                "transition-transform duration-200 ease-out active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                fabActive && "ring-4 ring-primary/15",
              )}
            >
              <Plus className="size-7 stroke-[2.25]" />
            </Link>
            <span aria-hidden className="h-10" />
          </div>

          <div className="flex min-w-0 flex-1 justify-around">
            {rightNav.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </div>
  );
}
