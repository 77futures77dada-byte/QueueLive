import { ru } from "./ru";

// Only Russian is wired up for MVP. Swapping this for a locale-aware
// lookup (e.g. keyed by a `lang` cookie) is the extension point for i18n.
export const t = ru;
