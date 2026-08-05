"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { ReportButtons } from "@/components/ReportButtons";
import { LocationNotes } from "@/components/LocationNotes";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location, LocationNote } from "@/types/database";

const STATUS_COLOR: Record<AggregatedStatus["status"], string> = {
  low: "var(--status-low)",
  medium: "var(--status-medium)",
  high: "var(--status-high)",
  stale: "var(--muted)",
  "no-data": "var(--muted)",
};

/** Below this zoom, badges collapse to plain dots so nearby markers don't
 * turn into a wall of overlapping text. */
export const BADGE_ZOOM_THRESHOLD = 13;

const BADGE_SIZE: [number, number] = [46, 30];
const DOT_SIZE: [number, number] = [14, 14];

function badgeText(status: AggregatedStatus): string {
  if (status.peopleCount !== null) return `~${status.peopleCount}`;
  return t.statusShort[status.status];
}

function buildIcon(status: AggregatedStatus, zoom: number) {
  const color = STATUS_COLOR[status.status];
  const isFaded = status.status === "stale" || status.status === "no-data";
  const opacity = isFaded ? 0.6 : 1;

  if (zoom < BADGE_ZOOM_THRESHOLD) {
    const [w, h] = DOT_SIZE;
    const html = `
      <div style="width:${w}px;height:${h}px;border-radius:9999px;background:${color};opacity:${opacity};border:2px solid white;box-shadow:0 1px 3px rgba(51,50,46,0.35)"></div>
    `;
    return L.divIcon({
      html,
      className: "",
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
      popupAnchor: [0, -h / 2],
    });
  }

  const [w, h] = BADGE_SIZE;
  const pulse =
    status.status === "high"
      ? `<span style="position:absolute;inset:-4px;border-radius:9999px;background:${color};opacity:0.35;animation:soft-pulse-ring 2s ease-out infinite"></span>`
      : "";

  const html = `
    <div style="position:relative;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center">
      ${pulse}
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:24px;border-radius:9999px;background:${color};opacity:${opacity};box-shadow:0 2px 6px rgba(51,50,46,0.3);color:white;font-family:var(--font-humanist),system-ui,sans-serif;font-size:11px;font-weight:600;line-height:1;padding:0 6px;white-space:nowrap">
        ${badgeText(status)}
      </div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};opacity:${opacity}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 2],
  });
}

interface Props {
  location: Location;
  status: AggregatedStatus;
  notes: LocationNote[];
  zoom: number;
  isSelected?: boolean;
  onOpen?: () => void;
}

export function LocationMarker({ location, status, notes, zoom, isSelected, onOpen }: Props) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected) markerRef.current?.openPopup();
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[location.lat, location.lng]}
      icon={buildIcon(status, zoom)}
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
