"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { cn } from "@/shared/lib";
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
    <div
      className={cn(
        "md:hidden",
        "pointer-events-none fixed inset-x-0 z-40 flex justify-center",
        "bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))]",
        "px-4",
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto",
          "flex items-center gap-2",
          "rounded-full border border-border/60",
          "bg-sidebar/95 supports-backdrop-filter:bg-sidebar/75 backdrop-blur-xs",
          "shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]",
          "px-2.5 py-2",
        )}
      >
        {NAV.map((item) => {
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
                "group relative inline-flex items-center justify-center",
                "size-12 shrink-0 rounded-full overflow-hidden isolate",
                "transition-[color,box-shadow] duration-200 ease-out",
                "active:scale-[0.92]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                active
                  ? "text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/40 ring-4 ring-sidebar-primary/15"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
              )}
            >
              {/* Animated pill background. Always rendered; opacity + scale react to active state. */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 -z-10 rounded-full",
                  "bg-sidebar-primary",
                  "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  active ? "opacity-100 scale-100" : "opacity-0 scale-75",
                )}
              />
              {/* Hover tint for inactive items only. */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 -z-10 rounded-full bg-sidebar-accent/40",
                  "transition-opacity duration-200 ease-out",
                  active ? "opacity-0" : "opacity-0 group-hover:opacity-100",
                )}
              />
              {/* Icon: re-keyed on active to re-trigger the pop animation each route change. */}
              <span
                key={active ? "on" : "off"}
                className={cn(
                  "inline-flex items-center justify-center",
                  "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  active && "animate-nav-pop",
                )}
              >
                <Icon className="size-[22px]" />
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
