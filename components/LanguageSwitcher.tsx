"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import { LOCALES } from "@/lib/i18n";

const LABELS: Record<string, string> = { et: "ET", ru: "RU", en: "EN" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full bg-paper/80 p-1 text-xs font-medium shadow-sm backdrop-blur">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-2.5 py-1 transition-colors duration-200 ${
            locale === code
              ? "bg-primary text-paper"
              : "text-muted hover:bg-primary-tint hover:text-primary"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
