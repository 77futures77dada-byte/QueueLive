"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "queuelive_locale";
const DEFAULT_LOCALE: Locale = "et";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof dictionaries)[Locale];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // No browser-language auto-detection — first-visit default is always
  // Estonian, regardless of navigator.language. A saved preference (the
  // user having switched languages themselves before) still wins.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Reads localStorage, which isn't available during SSR, so a saved
    // preference can only be known after the first client render — this
    // one-time sync-on-mount is the standard exception to "don't setState
    // in an effect". If there's no saved preference, the default set above
    // already stands, so there's nothing to do.
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored && stored in dictionaries) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
