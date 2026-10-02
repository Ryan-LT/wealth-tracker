"use client";

import { useCallback, useEffect, useState } from "react";

import { PREFERENCES_SEED } from "@/entities/preferences";
import { useI18n, type Locale } from "@/shared/i18n";
import { readSessionUser } from "@/shared/lib/session-user";
import { flushTablesNow, useInitialLoadDone, useTable } from "@/shared/storage";

import { reloadInLocale } from "./switch-locale";

/** Change language: saved on this device and, when signed in, in the account. */
export function useSwitchLanguage() {
  const { locale } = useI18n();
  const [, setPrefs] = useTable("preferences", PREFERENCES_SEED);
  const [pending, setPending] = useState(false);

  const switchTo = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      setPending(true);
      if (readSessionUser()) {
        setPrefs((p) => ({ ...p, locale: next }));
        await flushTablesNow().catch(() => false);
      }
      await reloadInLocale(next);
    },
    [locale, setPrefs],
  );

  return { locale, switchTo, pending };
}

/** Same as {@link useSwitchLanguage} for pages without account data (sign-in, sign-up). */
export function useSwitchLanguageSignedOut() {
  const { locale } = useI18n();
  const switchTo = useCallback(
    async (next: Locale) => {
      if (next !== locale) await reloadInLocale(next);
    },
    [locale],
  );
  return { locale, switchTo, pending: false };
}

const SYNC_GUARD = "wealthtracker:locale-sync";

/**
 * After sign-in on a new device: if the account's language differs from this
 * page's, switch once (guarded so a stuck cookie can't cause a reload loop).
 */
export function useFollowAccountLanguage() {
  const { locale } = useI18n();
  const [prefs] = useTable("preferences", PREFERENCES_SEED);
  const loaded = useInitialLoadDone();

  useEffect(() => {
    if (!loaded || !prefs.locale || prefs.locale === locale) return;
    try {
      if (sessionStorage.getItem(SYNC_GUARD) === prefs.locale) return;
      sessionStorage.setItem(SYNC_GUARD, prefs.locale);
    } catch {
      // Storage blocked: still switch once per page load.
    }
    void reloadInLocale(prefs.locale);
  }, [loaded, prefs.locale, locale]);
}
