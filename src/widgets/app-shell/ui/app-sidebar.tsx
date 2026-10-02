"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic, type MouseEvent } from "react";

import { BRAND, isNavActive, NAV_GROUPS } from "@/shared/config";
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
import { Logo } from "@/shared/ui/logo";

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
            <SidebarMenuButton size="lg" asChild tooltip={BRAND.name}>
              <Link href="/" onClick={(e) => navigate(e, "/")}>
                <Logo size={32} decorative className="size-8!" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-base font-semibold tracking-tight">{BRAND.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{BRAND.descriptor}</span>
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
                    <SidebarMenuButton
                      asChild
                      isActive={isNavActive(activePath, item.href)}
                      tooltip={item.label}
                      className="data-[active=true]:bg-primary-soft data-[active=true]:text-primary-soft-foreground data-[active=true]:[&>svg]:text-primary-soft-foreground"
                    >
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
