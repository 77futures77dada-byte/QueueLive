"use client";

import { useReportSubmit } from "@/lib/useReportSubmit";
import { ReportConfirmationButtons } from "@/components/ReportConfirmationButtons";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Department, Location, LoadLevel } from "@/types/database";

const STATUS_DOT_CLASS: Record<AggregatedStatus["status"], string> = {
  low: "bg-status-low",
  medium: "bg-status-medium",
  high: "bg-status-high",
  stale: "border border-dashed border-muted",
  "no-data": "bg-muted-bg",
};

export interface DepartmentWithStatus extends Department {
  status: AggregatedStatus;
}

interface RowProps {
  location: Location;
  department: DepartmentWithStatus;
}

function DepartmentRow({ location, department }: RowProps) {
  const { t } = useLocale();
  const { state, busy, submit } = useReportSubmit(location);

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

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[department.status.status]}`}
        />
        <p className="text-sm font-medium text-ink">
          {t.departments[department.slug as keyof typeof t.departments] ?? department.name}
        </p>
      </div>

      {department.status.lastReportId && (
        <div className="pl-4.5">
          <ReportConfirmationButtons reportId={department.status.lastReportId} />
        </div>
      )}

      {state.phase === "success" ? (
        <p className="text-xs font-medium text-primary">{t.report.success}</p>
      ) : (
        <div className="flex gap-1.5 pl-4.5">
          {LEVELS.map(({ level, label, className }) => (
            <button
              key={level}
              type="button"
              disabled={busy}
              onClick={() => submit(level, department.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 disabled:opacity-50 ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {state.phase === "error" && (
        <p className="pl-4.5 text-xs text-status-high">{state.message}</p>
      )}
    </div>
  );
}

interface Props {
  location: Location;
  departments: DepartmentWithStatus[];
}

/** Per-department queue reporting: each department gets its own status dot
 * and its own set of level buttons, replacing the old single
 * report-for-the-whole-location control. Shared between the map popup and
 * the sidebar's expanded row. */
export function DepartmentReportList({ location, departments }: Props) {
  if (departments.length === 0) return null;

  return (
    <div className="flex flex-col divide-y divide-black/5">
      {departments.map((department) => (
        <DepartmentRow key={department.id} location={location} department={department} />
      ))}
    </div>
  );
}
