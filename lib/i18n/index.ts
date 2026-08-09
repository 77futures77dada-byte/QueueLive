import { ru } from "./ru";
import { et } from "./et";
import { en } from "./en";

export const dictionaries = { et, ru, en };
export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof ru;

export const LOCALES: Locale[] = ["et", "ru", "en"];

// Backwards-compatible default export for any leftover static imports —
// prefer `useLocale()` from "@/lib/i18n/LocaleContext" in components.
export const t = ru;
