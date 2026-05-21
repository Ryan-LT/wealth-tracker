"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { cn } from "@/shared/lib";
import { useLayout } from "@/widgets/app-sidebar/lib/layout-provider";
import { NavUser } from "@/widgets/app-sidebar/ui/nav-user";
import { NAV } from "@/shared/config";
import { Wallet } from "lucide-react";

function isActive(activeHref: string, href: string) {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { isMobile, setOpenMobile } = useSidebar();
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
    if (isMobile) {
      setOpenMobile(false);
    }
    if (href === pathname) {
      return;
    }
    startTransition(() => {
      setOptimisticActive(href);
      router.push(href);
    });
  };

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Wallet className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Wealth Tracker</span>
                <span className="text-muted-foreground truncate text-xs">
                  Private Terminal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(optimisticActive, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "group/nav-item relative overflow-hidden transition-colors duration-200 ease-out",
                        "[&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                        "hover:[&>svg]:scale-110",
                        active && "[&>svg]:scale-110",
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={(event) => handleNavigate(event, item.href)}
                      >
                        {/* Active-state slide-in rail on the leading edge. */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-sidebar-primary origin-center",
                            "transition-[opacity,transform] duration-300 ease-out",
                            active
                              ? "opacity-100 scale-y-100 animate-nav-rail-in"
                              : "opacity-0 scale-y-50",
                          )}
                        />
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
