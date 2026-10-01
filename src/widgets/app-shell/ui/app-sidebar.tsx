"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic, type MouseEvent } from "react";

import { isNavActive, NAV_GROUPS } from "@/shared/config";
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
} from "@/shared/ui/kit/sidebar";
import { WealthTrackerLogo } from "@/shared/ui/wealth-tracker-logo";

import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  // Highlight the destination immediately while the route transition runs.
  const [activePath, setActivePath] = useOptimistic(pathname);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (isMobile) setOpenMobile(false);
    if (href === pathname) return;
    startTransition(() => {
      setActivePath(href);
      router.push(href);
    });
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Wealth Tracker">
              <Link href="/" onClick={(e) => navigate(e, "/")}>
                <WealthTrackerLogo size={32} decorative className="rounded-md" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Wealth Tracker</span>
                  <span className="truncate text-xs text-muted-foreground">Personal finance</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isNavActive(activePath, item.href)} tooltip={item.label}>
                      <Link href={item.href} onClick={(e) => navigate(e, item.href)}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
