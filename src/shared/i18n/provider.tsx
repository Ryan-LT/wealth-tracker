"use client";

import { createContext, useContext, type ReactNode } from "react";

import { messagesFor, setActiveLocale } from "./active";
import type { Locale } from "./locale";
import { en, type Messages } from "./messages/en";

type I18nValue = { locale: Locale; t: Messages };

const I18nContext = createContext<I18nValue>({ locale: "en", t: en });

/**
 * Provides the page's language. It is fixed for a page load (each language is
 * its own prerendered page; switching reloads), so code outside React reads
 * it from `activeMessages()` / the formatters.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  setActiveLocale(locale);
  return <I18nContext.Provider value={{ locale, t: messagesFor(locale) }}>{children}</I18nContext.Provider>;
}

/** `{ locale, t }`: `t.goals.title`, `t.common.months({ count })`. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
