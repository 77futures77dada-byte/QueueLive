"use client";

import { DepartmentReportList } from "@/components/DepartmentReportList";
import { NoteComposer } from "@/components/NoteComposer";
import { LocationNotes } from "@/components/LocationNotes";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationNote } from "@/types/database";

interface Props {
  location: Location;
  status: AggregatedStatus;
  departments: DepartmentWithStatus[];
  notes: LocationNote[];
}

/** The guts of a location's detail view — name, contact actions, status,
 * notes, per-department reporting. Shared between the desktop map popup
 * (LocationMarker) and the mobile bottom sheet (LocationDetailSheet) so
 * the two surfaces can't drift out of sync with each other. */
export function LocationDetailContent({ location, status, departments, notes }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-base leading-snug font-semibold text-ink">{location.name}</p>
        <p className="text-sm text-muted">{t.locationType[location.type]}</p>
        {location.address && <p className="mt-1 text-sm text-muted">{location.address}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center rounded-full bg-primary-tint px-3.5 text-xs font-medium text-primary hover:bg-primary-tint/70"
        >
          {t.location.getDirections}
        </a>
        {location.phone && (
          <a
            href={`tel:${location.phone}`}
            className="flex min-h-11 items-center rounded-full bg-primary-tint px-3.5 text-xs font-medium text-primary hover:bg-primary-tint/70"
          >
            {t.location.call} {location.phone}
          </a>
        )}
      </div>

      <p
        className={`rounded-xl bg-primary-tint px-3 py-2 text-sm text-ink ${
          status.confidence === "low" ? "opacity-60" : ""
        }`}
      >
        <span className="font-semibold">{t.status[status.status]}</span>
        {status.confidence === "medium" && (
          <span className="ml-1.5 text-xs text-muted">🕒 {t.confidence.mediumNote}</span>
        )}
        {status.confidence === "low" && (
          <span className="block text-xs font-medium text-status-medium">
            {t.confidence.lowNote}
          </span>
        )}
        <span className="block text-xs text-muted">
          {status.minutesAgo === null ? t.report.neverReported : t.report.updatedAgo(status.minutesAgo)}
        </span>
        <span className="block text-xs text-muted">
          {t.report.reportsCountLastHour(status.reportsLastHour)}
        </span>
      </p>

      <LocationNotes notes={notes} />

      {departments.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">{t.report.prompt}</p>
          <DepartmentReportList location={location} departments={departments} />
        </div>
      )}

      <NoteComposer location={location} />
    </div>
  );
}
