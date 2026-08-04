"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { checkNearLocation } from "@/lib/geo";
import { minutesUntilAllowed, recordReportSubmitted } from "@/lib/rateLimit";
import { t } from "@/lib/i18n";
import type { Location, LoadLevel } from "@/types/database";

const LEVELS: { level: LoadLevel; label: string; className: string }[] = [
  { level: "low", label: t.status.low, className: "bg-green-600 hover:bg-green-700" },
  { level: "medium", label: t.status.medium, className: "bg-yellow-500 hover:bg-yellow-600" },
  { level: "high", label: t.status.high, className: "bg-red-600 hover:bg-red-700" },
];

interface Props {
  location: Location;
  onSubmitted?: () => void;
}

type SubmitState =
  | { phase: "idle" }
  | { phase: "checking-geo" }
  | { phase: "submitting" }
  | { phase: "success" }
  | { phase: "error"; message: string };

export function ReportButtons({ location, onSubmitted }: Props) {
  const [state, setState] = useState<SubmitState>({ phase: "idle" });

  async function handleReport(level: LoadLevel) {
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
    setState({ phase: "success" });
    onSubmitted?.();
  }

  if (state.phase === "success") {
    return <p className="text-sm text-green-700">{t.report.success}</p>;
  }

  const busy = state.phase === "checking-geo" || state.phase === "submitting";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t.report.prompt}</p>
      <div className="flex flex-col gap-1.5">
        {LEVELS.map(({ level, label, className }) => (
          <button
            key={level}
            type="button"
            disabled={busy}
            onClick={() => handleReport(level)}
            className={`rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${className}`}
          >
            {busy ? t.report.submitting : label}
          </button>
        ))}
      </div>
      {state.phase === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </div>
  );
}
