"use client";

import { useReportSubmit } from "@/lib/useReportSubmit";
import { t } from "@/lib/i18n";
import type { Location, LoadLevel } from "@/types/database";

const LEVELS: { level: LoadLevel; label: string; className: string }[] = [
  {
    level: "low",
    label: t.statusShort.low,
    className: "bg-status-low/15 text-status-low hover:bg-status-low/25",
  },
  {
    level: "medium",
    label: t.statusShort.medium,
    className: "bg-status-medium/15 text-status-medium hover:bg-status-medium/25",
  },
  {
    level: "high",
    label: t.statusShort.high,
    className: "bg-status-high/15 text-status-high hover:bg-status-high/25",
  },
];

interface Props {
  location: Location;
  onSubmitted?: () => void;
}

/** Compact horizontal variant of ReportButtons for the sidebar list rows —
 * same submit logic via useReportSubmit, just a smaller footprint. */
export function ReportButtonsCompact({ location, onSubmitted }: Props) {
  const { state, busy, submit } = useReportSubmit(location, onSubmitted);

  if (state.phase === "success") {
    return <p className="text-xs font-medium text-primary">{t.report.success}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        {LEVELS.map(({ level, label, className }) => (
          <button
            key={level}
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              submit(level);
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 disabled:opacity-50 ${className}`}
          >
            {label}
          </button>
        ))}
      </div>
      {state.phase === "error" && (
        <p className="text-xs text-status-high">{state.message}</p>
      )}
    </div>
  );
}
