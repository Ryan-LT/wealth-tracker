/** Languages the app is translated into. English is the source language of the message files. */
export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];

/** Everyone starts in Vietnamese, whatever the browser says, until they pick another language. */
export const DEFAULT_LOCALE: Locale = "vi";

/**
 * Device cookie holding a language the person chose (or that their account
 * has). Read by the proxy on every page request; absent means Vietnamese.
 */
export const LOCALE_COOKIE = "wt_locale";
/** Earlier cookie, set automatically from the browser language; ignored and cleared. */
export const LEGACY_LOCALE_COOKIE = "wt_lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The page language for a request: the chosen language, else Vietnamese. */
export function resolveLocale(cookieValue: string | null | undefined): Locale {
  return isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}
