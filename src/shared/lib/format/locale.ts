import type { Locale } from "@/shared/i18n/locale";

/**
 * Language used by the formatters. Set once per page load by the i18n
 * provider (switching language reloads the page), so formatters stay plain
 * functions instead of needing the locale threaded through every call.
 */
let active: Locale = "en";

export function setFormatLocale(locale: Locale): void {
  active = locale;
}

export function formatLocale(): Locale {
  return active;
}
