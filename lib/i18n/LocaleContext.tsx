"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, LOCALES, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "queuelive_locale";

// Priority order for auto-detecting from the browser when there's no saved
// preference: Estonian first (the app's home market), then Russian (the
// largest minority language here), then English as the catch-all.
function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "et";
  const browserLangs = navigator.languages ?? [navigator.language];
  for (const preferred of LOCALES) {
    if (browserLangs.some((lang) => lang.toLowerCase().startsWith(preferred))) {
      return preferred;
    }
  }
  return "en";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof dictionaries)[Locale];
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("et");

  useEffect(() => {
    // Reads browser-only state (localStorage/navigator.languages) that isn't
    // available during SSR, so the real locale can only be known after the
    // first client render — this one-time sync-on-mount is the standard
    // exception to "don't setState in an effect".
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(stored && stored in dictionaries ? (stored as Locale) : detectLocale());
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
