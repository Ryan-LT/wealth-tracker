"use client";

import { ChevronsUpDown, Languages, LogOut, Palette, Settings } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { useSignOut } from "@/features/sign-out";
import { LANGUAGE_OPTIONS, useSwitchLanguage } from "@/features/switch-language";
import { useI18n, type Locale } from "@/shared/i18n";
import { getDisplayNameInitials } from "@/shared/lib/cn";
import { Avatar, AvatarFallback } from "@/shared/ui/kit/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSegmentItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/shared/ui/kit/sidebar";

import { useShell } from "../model/shell-context";
import { THEME_OPTIONS } from "./theme-toggle";

export function NavUser() {
  const { userName, authEnabled } = useShell();
  const { t } = useI18n();
  const { isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { signOut, pending } = useSignOut();
  const { locale, switchTo } = useSwitchLanguage();
  const initials = getDisplayNameInitials(userName) || "WT";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {authEnabled ? t.shell.user.signedIn : t.shell.user.localMode}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 p-1.5"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 font-normal">
              <Avatar className="size-9 rounded-md">
                <AvatarFallback className="rounded-md bg-primary-soft text-sm font-semibold text-primary-soft-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 leading-tight">
                <span className="truncate text-sm font-semibold">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {authEnabled ? t.shell.user.workspace : t.shell.user.localMode}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Preferences apply instantly; the menu stays open. */}
            <div className="grid gap-0.5 py-1">
              <div className="flex items-center justify-between gap-3 px-2 py-1">
                <span className="flex items-center gap-2 text-sm">
                  <Palette className="size-4 text-muted-foreground" aria-hidden />
                  {t.common.theme}
                </span>
                <DropdownMenuRadioGroup
                  value={theme ?? "system"}
                  onValueChange={setTheme}
                  aria-label={t.common.theme}
                  className="inline-flex gap-0.5 rounded-md border bg-muted/60 p-0.5"
                >
                  {THEME_OPTIONS.map((o) => (
                    <DropdownMenuSegmentItem key={o.value} value={o.value} aria-label={t.common[o.labelKey]} title={t.common[o.labelKey]}>
                      <o.icon />
                    </DropdownMenuSegmentItem>
                  ))}
                </DropdownMenuRadioGroup>
              </div>
              <div className="flex items-center justify-between gap-3 px-2 py-1">
                <span className="flex items-center gap-2 text-sm">
                  <Languages className="size-4 text-muted-foreground" aria-hidden />
                  {t.common.language}
                </span>
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={(v) => void switchTo(v as Locale)}
                  aria-label={t.common.language}
                  className="inline-flex gap-0.5 rounded-md border bg-muted/60 p-0.5"
                >
                  {LANGUAGE_OPTIONS.map((o) => (
                    <DropdownMenuSegmentItem key={o.value} value={o.value} lang={o.value} aria-label={o.label} title={o.label} className="min-w-9">
                      {o.short}
                    </DropdownMenuSegmentItem>
                  ))}
                </DropdownMenuRadioGroup>
              </div>
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={() => setOpenMobile(false)}>
                <Settings />
                {t.nav.items.settings.label}
              </Link>
            </DropdownMenuItem>
            {authEnabled ? (
              <DropdownMenuItem variant="destructive" disabled={pending} onSelect={() => void signOut()}>
                <LogOut />
                {t.shell.user.signOut}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
