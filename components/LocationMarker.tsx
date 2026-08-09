"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { DepartmentReportList } from "@/components/DepartmentReportList";
import { NoteComposer } from "@/components/NoteComposer";
import { LocationNotes } from "@/components/LocationNotes";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationNote } from "@/types/database";

// Status now lives on a small badge, not the pin itself — the pin's job is
// just to say "medical location here" (universal red teardrop), the badge's
// job is to say how busy it currently is.
const STATUS_COLOR: Record<"low" | "medium" | "high", string> = {
  low: "var(--status-low)",
  medium: "var(--status-medium)",
  high: "var(--status-high)",
};

const PIN_COLOR = "#dc2626"; // saturated medical red — the map convention for "hospital"
const BADGE_GRAY = "#9a9890";
const PIN_WIDTH = 28;
const PIN_HEIGHT = 36;
const BADGE_CX = 21;
const BADGE_CY = 10;
const BADGE_R = 5.5;

function buildBadge(status: AggregatedStatus): string {
  if (status.status === "no-data") return ""; // pin alone still reads as "hospital"

  if (status.status === "stale") {
    return `<circle cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" fill="${BADGE_GRAY}" stroke="white" stroke-width="2" />`;
  }

  const color = STATUS_COLOR[status.status];
  const pulse =
    status.status === "high"
      ? `<circle class="marker-pulse-ring" cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" fill="${color}" />`
      : "";

  return `${pulse}<circle cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" fill="${color}" stroke="white" stroke-width="2" />`;
}

function buildIcon(status: AggregatedStatus) {
  const badge = buildBadge(status);

  const html = `
    <svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(51,50,46,0.4))">
      <path d="M14 1.5C7.65 1.5 2.5 6.65 2.5 13c0 8.2 11.5 21.5 11.5 21.5S25.5 21.2 25.5 13C25.5 6.65 20.35 1.5 14 1.5z" fill="${PIN_COLOR}" stroke="white" stroke-width="1.5" />
      ${badge}
    </svg>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
    popupAnchor: [0, -PIN_HEIGHT + 6],
  });
}

interface Props {
  location: Location;
  status: AggregatedStatus;
  departments: DepartmentWithStatus[];
  notes: LocationNote[];
  isSelected?: boolean;
  onOpen?: () => void;
}

export function LocationMarker({ location, status, departments, notes, isSelected, onOpen }: Props) {
  const { t } = useLocale();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected) markerRef.current?.openPopup();
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[location.lat, location.lng]}
      icon={buildIcon(status)}
      eventHandlers={{ popupopen: () => onOpen?.() }}
    >
      <Popup minWidth={260} maxHeight={420}>
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-base leading-snug font-semibold text-ink">
              {location.name}
            </p>
            <p className="text-sm text-muted">{t.locationType[location.type]}</p>
            {location.address && (
              <p className="mt-1 text-sm text-muted">{location.address}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-tint px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-tint/70"
            >
              {t.location.getDirections}
            </a>
            {location.phone && (
              <a
                href={`tel:${location.phone}`}
                className="rounded-full bg-primary-tint px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-tint/70"
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
              {status.minutesAgo === null
                ? t.report.neverReported
                : t.report.updatedAgo(status.minutesAgo)}
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
      </Popup>
    </Marker>
  );
}
