"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { useI18n } from "@/shared/i18n";
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

import { useOptimisticNavigation } from "../model/navigation";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useI18n();
  // Highlights the destination immediately while the route renders.
  const { activePath, onLinkClick } = useOptimisticNavigation();

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isMobile) setOpenMobile(false);
    onLinkClick(event, href);
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
                  <span className="truncate text-xs text-muted-foreground">{t.common.brandDescriptor}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{t.nav.groups[group.id]}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavActive(activePath, item.href)}
                      tooltip={t.nav.items[item.id].label}
                      className="data-[active=true]:bg-primary-soft data-[active=true]:text-primary-soft-foreground data-[active=true]:[&>svg]:text-primary-soft-foreground"
                    >
                      <Link href={item.href} onClick={(e) => navigate(e, item.href)}>
                        <item.icon />
                        <span>{t.nav.items[item.id].label}</span>
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
