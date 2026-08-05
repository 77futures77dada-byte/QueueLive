"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { checkNearLocation } from "@/lib/geo";
import { minutesUntilAllowed, recordReportSubmitted } from "@/lib/rateLimit";
import { t } from "@/lib/i18n";
import type { Location, LoadLevel } from "@/types/database";

export type ReportSubmitState =
  | { phase: "idle" }
  | { phase: "checking-geo" }
  | { phase: "submitting" }
  | { phase: "success" }
  | { phase: "error"; message: string };

export interface ReportNote {
  text?: string;
  photoFile?: File | null;
}

const NOTES_BUCKET = "location-photos";

/** Best-effort: uploads the photo (if any) and inserts the note row. Failures
 * here don't block the queue_reports submission that already succeeded —
 * the load-level report is the part that matters most. */
async function submitNote(location: Location, note: ReportNote) {
  let photoUrl: string | null = null;

  if (note.photoFile) {
    const ext = note.photoFile.name.split(".").pop() ?? "jpg";
    const path = `${location.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(NOTES_BUCKET)
      .upload(path, note.photoFile);

    if (uploadError) {
      console.error("Photo upload failed:", uploadError.message);
    } else {
      photoUrl = supabase.storage.from(NOTES_BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const text = note.text?.trim();
  if (!text && !photoUrl) return;

  const { error } = await supabase.from("location_notes").insert({
    location_id: location.id,
    text: text || null,
    photo_url: photoUrl,
    device_id: getDeviceId(),
  });

  if (error) console.error("Note insert failed:", error.message);
}

/** Shared geo-check + rate-limit + insert flow for reporting a location's
 * queue load. Used by both the map popup and the sidebar row — the two
 * only differ in how they render `state`. */
export function useReportSubmit(location: Location, onSubmitted?: () => void) {
  const [state, setState] = useState<ReportSubmitState>({ phase: "idle" });

  async function submit(level: LoadLevel, note?: ReportNote) {
    const blockedForMinutes = minutesUntilAllowed(location.id);
    if (blockedForMinutes > 0) {
      setState({ phase: "error", message: t.rateLimit.tooSoon });
      return;
    }

    setState({ phase: "checking-geo" });
    const geo = await checkNearLocation({ lat: location.lat, lng: location.lng });
    if (!geo.ok) {
      const message =
        geo.reason === "too_far"
          ? t.geoCheck.tooFar(geo.distanceM ?? 0)
          : geo.reason === "denied"
            ? t.geoCheck.denied
            : t.geoCheck.unavailable;
      setState({ phase: "error", message });
      return;
    }

    setState({ phase: "submitting" });
    const { error } = await supabase.from("queue_reports").insert({
      location_id: location.id,
      load_level: level,
      device_id: getDeviceId(),
    });

    if (error) {
      setState({ phase: "error", message: error.message });
      return;
    }

    recordReportSubmitted(location.id);

    if (note?.text || note?.photoFile) {
      await submitNote(location, note);
    }

    setState({ phase: "success" });
    onSubmitted?.();
  }

  const busy = state.phase === "checking-geo" || state.phase === "submitting";

  return { state, busy, submit };
}
