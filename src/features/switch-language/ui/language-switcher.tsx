"use client";

import { Languages } from "lucide-react";

import type { Locale } from "@/shared/i18n";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { useSwitchLanguage, useSwitchLanguageSignedOut } from "../model/use-switch-language";

/** Each language is named in itself, so it's findable whatever the current language. */
export const LANGUAGE_OPTIONS: { value: Locale; label: string; short: string }[] = [
  { value: "vi", label: "Tiếng Việt", short: "VI" },
  { value: "en", label: "English", short: "EN" },
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
