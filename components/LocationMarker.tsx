"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { ReportButtons } from "@/components/ReportButtons";
import { LocationNotes } from "@/components/LocationNotes";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location, LocationNote } from "@/types/database";

// Reported statuses get the real status color; no-data/stale share one
// calm neutral tone (a faded version of the accent blue) — the map's job
// is just to show *where* things are until someone actually reports.
const STATUS_COLOR: Record<AggregatedStatus["status"], string> = {
  low: "var(--status-low)",
  medium: "var(--status-medium)",
  high: "var(--status-high)",
  stale: "var(--primary)",
  "no-data": "var(--primary)",
};

// One size for every state — status is color-only, never size, so the map
// never reads as "growing with alarm".
const MARKER_SIZE = 20;

function buildIcon(status: AggregatedStatus) {
  const color = STATUS_COLOR[status.status];
  const isNeutral = status.status === "stale" || status.status === "no-data";
  const pulse =
    status.status === "high"
      ? `<circle class="marker-pulse-ring" cx="10" cy="10" r="6" fill="${color}" />`
      : "";

  const html = `
    <svg width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(51,50,46,0.35))">
      ${pulse}
      <circle cx="10" cy="10" r="7" fill="${color}" fill-opacity="${isNeutral ? 0.45 : 0.9}" stroke="white" stroke-width="2" />
    </svg>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
    popupAnchor: [0, -MARKER_SIZE / 2],
  });
}

interface Props {
  location: Location;
  status: AggregatedStatus;
  notes: LocationNote[];
  isSelected?: boolean;
  onOpen?: () => void;
}

export function LocationMarker({ location, status, notes, isSelected, onOpen }: Props) {
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
      <Popup minWidth={260}>
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

          <p className="rounded-xl bg-primary-tint px-3 py-2 text-sm text-ink">
            <span className="font-semibold">{t.status[status.status]}</span>
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

          <ReportButtons location={location} />
        </div>
      </Popup>
    </Marker>
  );
}
