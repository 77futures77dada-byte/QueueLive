"use client";

import { useRef, useState } from "react";
import { useNoteSubmit } from "@/lib/useReportSubmit";
import { validateNoteText } from "@/lib/noteModeration";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Location } from "@/types/database";

const MAX_NOTE_LENGTH = 300;

interface Props {
  location: Location;
  onSubmitted?: () => void;
}

/** Standalone text/photo note about a location — split out from the queue
 * report itself now that reporting happens per department, since a note is
 * about the location as a whole, not any one department. */
export function NoteComposer({ location, onSubmitted }: Props) {
  const { t } = useLocale();
  const { state, busy, submit } = useNoteSubmit(location, onSubmitted);
  const [text, setText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const validation = validateNoteText(text);
    if (!validation.ok) {
      setNoteError(validation.reason);
      return;
    }
    setNoteError(null);
    submit({ text, photoFile });
  }

  if (state.phase === "success") {
    return (
      <p className="rounded-xl bg-primary-tint px-3 py-2 text-sm font-medium text-primary">
        {t.report.success}
      </p>
    );
  }

  const canSubmit = (text.trim().length > 0 || photoFile !== null) && !busy;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">{t.notes.addNoteLabel}</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, MAX_NOTE_LENGTH));
          setNoteError(null);
        }}
        placeholder={t.notes.placeholder}
        rows={2}
        disabled={busy}
        className="rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-primary disabled:opacity-50"
      />
      {noteError && <p className="text-xs text-status-high">{noteError}</p>}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted hover:bg-black/5 disabled:opacity-50"
        >
          {photoFile ? t.notes.photoAttached : t.notes.attachPhoto}
        </button>
        {photoFile && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPhotoFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-muted underline"
          >
            {t.notes.removePhoto}
          </button>
        )}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="ml-auto rounded-full bg-primary px-3 py-1 text-xs font-medium text-paper transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? t.report.submitting : t.report.submit}
        </button>
      </div>

      {state.phase === "error" && (
        <p className="rounded-xl bg-status-high/15 px-3 py-2 text-sm text-status-high">
          {state.message}
        </p>
      )}
    </div>
  );
}
