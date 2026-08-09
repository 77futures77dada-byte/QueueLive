"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { checkNearLocation } from "@/lib/geo";
import { minutesUntilAllowed, recordReportSubmitted } from "@/lib/rateLimit";
import { useLocale } from "@/lib/i18n/LocaleContext";
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

/** Shared geo-check + rate-limit flow for anything that reports on a
 * location: a department's queue level, or a standalone note. Both use
 * the same location-scoped rate limit and geofence — see
 * useReportSubmit/useNoteSubmit below for the two actions built on it. */
function useLocationGate(location: Location) {
  const { t } = useLocale();

  async function checkGate(): Promise<{ ok: true } | { ok: false; message: string }> {
    const blockedForMinutes = minutesUntilAllowed(location.id);
    if (blockedForMinutes > 0) {
      return { ok: false, message: t.rateLimit.tooSoon };
    }

    const geo = await checkNearLocation({ lat: location.lat, lng: location.lng });
    if (!geo.ok) {
      const message =
        geo.reason === "too_far"
          ? t.geoCheck.tooFar(geo.distanceM ?? 0)
          : geo.reason === "denied"
            ? t.geoCheck.denied
            : t.geoCheck.unavailable;
      return { ok: false, message };
    }

    return { ok: true };
  }

  return checkGate;
}

/** Geo-check + rate-limit + insert flow for reporting a department's queue
 * load. Used by DepartmentReportList in both the map popup and the sidebar
 * row — the two only differ in how they render `state`. */
export function useReportSubmit(location: Location, onSubmitted?: () => void) {
  const checkGate = useLocationGate(location);
  const [state, setState] = useState<ReportSubmitState>({ phase: "idle" });

  async function submit(level: LoadLevel, departmentId: string | null) {
    setState({ phase: "checking-geo" });
    const gate = await checkGate();
    if (!gate.ok) {
      setState({ phase: "error", message: gate.message });
      return;
    }

    setState({ phase: "submitting" });
    const { error } = await supabase.from("queue_reports").insert({
      location_id: location.id,
      department_id: departmentId,
      load_level: level,
      device_id: getDeviceId(),
    });

    if (error) {
      setState({ phase: "error", message: error.message });
      return;
    }

    recordReportSubmitted(location.id);
    setState({ phase: "success" });
    onSubmitted?.();
  }

  const busy = state.phase === "checking-geo" || state.phase === "submitting";

  return { state, busy, submit };
}

/** Geo-check + rate-limit + insert flow for leaving a standalone note/photo
 * on a location — split out from useReportSubmit now that reporting is
 * per-department, since a note is about the location as a whole. */
export function useNoteSubmit(location: Location, onSubmitted?: () => void) {
  const checkGate = useLocationGate(location);
  const [state, setState] = useState<ReportSubmitState>({ phase: "idle" });

  async function submit(note: ReportNote) {
    setState({ phase: "checking-geo" });
    const gate = await checkGate();
    if (!gate.ok) {
      setState({ phase: "error", message: gate.message });
      return;
    }

    setState({ phase: "submitting" });

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
    const { error } = await supabase.from("location_notes").insert({
      location_id: location.id,
      text: text || null,
      photo_url: photoUrl,
      device_id: getDeviceId(),
    });

    if (error) {
      setState({ phase: "error", message: error.message });
      return;
    }

    recordReportSubmitted(location.id);
    setState({ phase: "success" });
    onSubmitted?.();
  }

  const busy = state.phase === "checking-geo" || state.phase === "submitting";

  return { state, busy, submit };
}
