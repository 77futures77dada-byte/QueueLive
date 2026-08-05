// Minimal client-side moderation for anonymous notes — same spirit as the
// rate-limit and geo-check elsewhere in the app: a courtesy filter against
// casual abuse, not a defense against someone determined to bypass it
// (they can always call the REST API directly). Good enough for an MVP
// with no accounts and no server-side moderation yet.

// Root fragments, not whole words, so common inflections/endings still
// match. Intentionally a minimal, representative list, not exhaustive.
const STOP_WORD_ROOTS = [
  "хуй",
  "хер",
  "пизд",
  "ебат",
  "ебал",
  "заеб",
  "бля",
  "мудак",
  "мудил",
  "гандон",
  "уебан",
  "долбоеб",
  "сука",
  "сучк",
  "пидор",
  "пидар",
  "гнида",
  "тварь",
  "ублюдок",
  "идиот",
  "дебил",
  "кретин",
];

const URL_PATTERN = /https?:\/\/|www\./i;

export type NoteValidationResult = { ok: true } | { ok: false; reason: string };

export function validateNoteText(text: string): NoteValidationResult {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return { ok: true };

  if (URL_PATTERN.test(normalized)) {
    return { ok: false, reason: "Текст не может быть опубликован" };
  }

  if (STOP_WORD_ROOTS.some((root) => normalized.includes(root))) {
    return { ok: false, reason: "Текст не может быть опубликован" };
  }

  return { ok: true };
}
