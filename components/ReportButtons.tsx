"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { checkNearLocation } from "@/lib/geo";
import { minutesUntilAllowed, recordReportSubmitted } from "@/lib/rateLimit";
import { t } from "@/lib/i18n";
import type { Location, LoadLevel } from "@/types/database";

const LEVELS: { level: LoadLevel; label: string; className: string }[] = [
  {
    level: "low",
    label: t.status.low,
    className: "border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
  },
  {
    level: "medium",
    label: t.status.medium,
    className: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
  },
  {
    level: "high",
    label: t.status.high,
    className: "border-ink bg-alarm text-paper hover:bg-paper hover:text-alarm",
  },
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
    return (
      <p className="border-2 border-ink bg-ink px-2 py-1 text-sm font-bold text-paper uppercase">
        {t.report.success}
      </p>
    );
  }

  const busy = state.phase === "checking-geo" || state.phase === "submitting";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold uppercase">{t.report.prompt}</p>
      <div className="flex flex-col gap-1.5">
        {LEVELS.map(({ level, label, className }) => (
          <button
            key={level}
            type="button"
            disabled={busy}
            onClick={() => handleReport(level)}
            className={`border-2 px-3 py-1.5 text-sm font-bold uppercase disabled:opacity-40 ${className}`}
          >
            {busy ? t.report.submitting : label}
          </button>
        ))}
      </div>
      {state.phase === "error" && (
        <p className="border-2 border-alarm px-2 py-1 text-sm font-bold text-alarm uppercase">
          {state.message}
        </p>
      )}
    </div>
  );
}
