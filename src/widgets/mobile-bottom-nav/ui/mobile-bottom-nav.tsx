"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { cn } from "@/shared/lib";
import { NAV, type NavItem } from "@/shared/config";

const [HOME_ITEM, ...SIDE_NAV] = NAV;
const LEFT_NAV = SIDE_NAV.slice(0, 2);
const RIGHT_NAV = SIDE_NAV.slice(2);

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

  const renderSideItem = (item: NavItem) => {
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
          "group flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1.5",
          "transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          active ? "text-primary" : "text-foreground/55 hover:text-foreground/80",
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

  const homeActive = isActive(optimisticActive, HOME_ITEM.href);
  const HomeIcon = HOME_ITEM.icon;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 md:hidden",
        "px-4",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto relative mx-auto w-full max-w-[400px]",
          "rounded-full border border-border/40 bg-card/95",
          "shadow-[0_8px_32px_-8px_oklch(0.25_0.04_265_/_18%)]",
          "supports-backdrop-filter:bg-card/10 backdrop-blur-md",
          "px-2 py-1.5",
        )}
      >
        <div className="flex items-end justify-between">
          <div className="flex min-w-0 flex-1 justify-around">
            {LEFT_NAV.map(renderSideItem)}
          </div>

          <div className="relative flex w-[4rem] shrink-0 flex-col items-center justify-end">
            <Link
              href={HOME_ITEM.href}
              onClick={(event) => handleNavigate(event, HOME_ITEM.href)}
              aria-current={homeActive ? "page" : undefined}
              aria-label={HOME_ITEM.label}
              title={HOME_ITEM.label}
              className={cn(
                "absolute -top-16 inline-flex size-14 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground",
                "shadow-[var(--shadow-fab)]",
                "transition-transform duration-200 ease-out active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                homeActive && "ring-4 ring-primary/15",
              )}
            >
              <span
                key={homeActive ? "on" : "off"}
                className={cn(
                  "inline-flex items-center justify-center",
                  homeActive && "animate-nav-pop",
                )}
              >
                <HomeIcon className="size-[26px] stroke-[1.85]" />
              </span>
            </Link>
          </div>
          <div className="flex min-w-0 flex-1 justify-around">
            {RIGHT_NAV.map(renderSideItem)}
          </div>
        </div>
      </nav>
    </div>
  );
}
