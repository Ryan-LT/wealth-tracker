import { setFormatLocale } from "@/shared/lib/format/locale";

import type { Locale } from "./locale";
import { en, type Messages } from "./messages/en";
import { vi } from "./messages/vi";

const DICTIONARIES: Record<Locale, Messages> = { en, vi };

let active: Locale = "en";

/**
 * The page's language for code outside React (domain fallbacks such as
 * "Untitled plan", formatters). One language per page load — switching
 * reloads — so a module-level setting is safe. Set by `I18nProvider`.
 */
export function setActiveLocale(locale: Locale): void {
  active = locale;
  setFormatLocale(locale);
}

export function activeLocale(): Locale {
  return active;
}

export function activeMessages(): Messages {
  return DICTIONARIES[active];
}

export function messagesFor(locale: Locale): Messages {
  return DICTIONARIES[locale];
}
