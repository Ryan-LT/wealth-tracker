"use client";

import { Languages } from "lucide-react";

import type { Locale } from "@/shared/i18n";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/shared/ui/kit/dropdown-menu";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { useSwitchLanguage, useSwitchLanguageSignedOut } from "../model/use-switch-language";

/** Each language is named in itself, so it's findable whatever the current language. */
export const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

/** Segmented control (Settings). */
export function LanguageSwitcher({ ariaLabel }: { ariaLabel: string }) {
  const { locale, switchTo } = useSwitchLanguage();
  return <SegmentedControl<Locale> aria-label={ariaLabel} value={locale} onValueChange={(v) => void switchTo(v)} options={LANGUAGE_OPTIONS} />;
}

/** Compact switcher for the sign-in / sign-up pages (no account yet). */
export function SignedOutLanguageSwitcher({ ariaLabel }: { ariaLabel: string }) {
  const { locale, switchTo } = useSwitchLanguageSignedOut();
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Languages className="size-4" aria-hidden />
      <SegmentedControl<Locale> aria-label={ariaLabel} value={locale} onValueChange={(v) => void switchTo(v)} options={LANGUAGE_OPTIONS} />
    </div>
  );
}

/** "Language" submenu for the user menu. */
export function LanguageMenu({ label }: { label: string }) {
  const { locale, switchTo } = useSwitchLanguage();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages />
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={locale} onValueChange={(v) => void switchTo(v as Locale)}>
          {LANGUAGE_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value} lang={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
