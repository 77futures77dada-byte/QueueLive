import { t } from "@/lib/i18n";
import type { LocationNote } from "@/types/database";

const MAX_TEXT_NOTES = 5;
const MAX_PHOTOS = 3;

function minutesAgo(createdAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
}

interface Props {
  notes: LocationNote[];
}

export function LocationNotes({ notes }: Props) {
  if (notes.length === 0) return null;

  const photos = notes.filter((n) => n.photo_url).slice(0, MAX_PHOTOS);
  const textNotes = notes.filter((n) => n.text).slice(0, MAX_TEXT_NOTES);

  if (photos.length === 0 && textNotes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {t.notes.recent}
      </p>

      {photos.length > 0 && (
        <div className="flex gap-2">
          {photos.map((note) => (
            <a
              key={note.id}
              href={note.photo_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-14 w-14 overflow-hidden rounded-lg bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small user-uploaded thumbnail, not worth next/image config for one MVP feature */}
              <img
                src={note.photo_url!}
                alt=""
                className="h-full w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {textNotes.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {textNotes.map((note) => (
            <li key={note.id} className="rounded-lg bg-surface px-2.5 py-1.5 text-sm text-ink">
              {note.text}
              <span className="ml-1.5 text-xs text-muted">{minutesAgo(note.created_at)} мин.</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
