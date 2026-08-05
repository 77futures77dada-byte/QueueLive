"use client";

import { useRef, useState } from "react";
import { useReportSubmit } from "@/lib/useReportSubmit";
import { validateNoteText } from "@/lib/noteModeration";
import { t } from "@/lib/i18n";
import type { Location, LoadLevel } from "@/types/database";

const LEVELS: { level: LoadLevel; label: string; className: string }[] = [
  {
    level: "low",
    label: t.status.low,
    className: "bg-status-low/15 text-status-low hover:bg-status-low/25",
  },
  {
    level: "medium",
    label: t.status.medium,
    className: "bg-status-medium/15 text-status-medium hover:bg-status-medium/25",
  },
  {
    level: "high",
    label: t.status.high,
    className: "bg-status-high/15 text-status-high hover:bg-status-high/25",
  },
];

const MAX_NOTE_LENGTH = 300;

interface Props {
  location: Location;
  onSubmitted?: () => void;
}

export function ReportButtons({ location, onSubmitted }: Props) {
  const { state, busy, submit } = useReportSubmit(location, onSubmitted);
  const [text, setText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validated before submit() is ever called, so a rejected note doesn't
  // burn the 15-minute rate-limit window — the person can just fix the
  // text and try again.
  function handleLevelClick(level: LoadLevel) {
    const validation = validateNoteText(text);
    if (!validation.ok) {
      setNoteError(validation.reason);
      return;
    }
    setNoteError(null);
    submit(level, { text, photoFile });
  }

  if (state.phase === "success") {
    return (
      <p className="rounded-xl bg-primary-tint px-3 py-2 text-sm font-medium text-primary">
        {t.report.success}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">{t.report.prompt}</p>

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
      </div>

      <div className="flex flex-col gap-2">
        {LEVELS.map(({ level, label, className }) => (
          <button
            key={level}
            type="button"
            disabled={busy}
            onClick={() => handleLevelClick(level)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${className}`}
          >
            {busy ? t.report.submitting : label}
          </button>
        ))}
      </div>
      {state.phase === "error" && (
        <p className="rounded-xl bg-status-high/15 px-3 py-2 text-sm text-status-high">
          {state.message}
        </p>
      )}
    </div>
  );
}
