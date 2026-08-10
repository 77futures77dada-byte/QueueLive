"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { LocationDetailContent } from "@/components/LocationDetailContent";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { estimateMinutes } from "@/lib/estimateMinutes";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationNote } from "@/types/database";

// The marker is now a pill showing a headline minute estimate, not an
// abstract colored pin — the Google Maps ETA / appointment-app pattern.
// Color still carries the status at a glance, but the number is the point:
// no click needed to see roughly how long the wait is.
const STATUS_BG: Record<"low" | "medium" | "high", string> = {
  low: "var(--status-low)",
  medium: "var(--status-medium)",
  high: "var(--status-high)",
};
const PILL_WIDTH = 68;
const PILL_HEIGHT = 26;
const TAIL_HEIGHT = 6;

// No estimate to show at all (no-data or expired/stale) doesn't get a pill —
// a full-weight pill with a dash inside reads as "this place has a status,
// and that status is unknown", which is a heavier claim than "we simply
// have nothing to show here". A small light dot, half the pill's height,
// makes the no-info state visually recede instead of competing with real
// estimates for attention.
const DOT_DIAMETER = 14;
const DOT_BG = "rgba(154, 152, 144, 0.45)";

interface EstimateText {
  estimate: { label: (minutes: number) => string; none: string };
}

function buildIcon(status: AggregatedStatus, t: EstimateText) {
  const minutes = estimateMinutes(status.status);

  if (minutes === null) {
    const html = `
      <div style="width:${DOT_DIAMETER}px; height:${DOT_DIAMETER}px; border-radius:50%; background:${DOT_BG}; border:1.5px solid white; box-shadow:0 1px 2px rgba(51,50,46,0.25);"></div>
    `;
    return L.divIcon({
      html,
      className: "",
      iconSize: [DOT_DIAMETER, DOT_DIAMETER],
      iconAnchor: [DOT_DIAMETER / 2, DOT_DIAMETER / 2],
      popupAnchor: [0, -DOT_DIAMETER / 2],
    });
  }

  const bg = STATUS_BG[status.status as "low" | "medium" | "high"];
  const label = t.estimate.label(minutes);
  const pillClass = status.status === "high" ? "marker-pill-high" : "";

  const html = `
    <div style="display:flex; flex-direction:column; align-items:center; width:${PILL_WIDTH}px;">
      <div class="${pillClass}" style="display:flex; align-items:center; justify-content:center; width:100%; height:${PILL_HEIGHT}px; border-radius:999px; background:${bg}; color:white; font-size:11px; font-weight:700; border:2px solid white; box-shadow:0 2px 4px rgba(51,50,46,0.35); white-space:nowrap;">
        ${label}
      </div>
      <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:${TAIL_HEIGHT}px solid ${bg}; margin-top:-1px;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [PILL_WIDTH, PILL_HEIGHT + TAIL_HEIGHT],
    iconAnchor: [PILL_WIDTH / 2, PILL_HEIGHT + TAIL_HEIGHT],
    popupAnchor: [0, -(PILL_HEIGHT + TAIL_HEIGHT)],
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

/** The marker + its desktop popup. Below md, the popup is hidden via CSS
 * (see globals.css) and LocationDetailSheet shows the same content as a
 * bottom sheet instead — see that component for why. */
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
      icon={buildIcon(status, t)}
      eventHandlers={{ popupopen: () => onOpen?.() }}
    >
      <Popup minWidth={260} maxHeight={420}>
        <div className="p-4">
          <LocationDetailContent
            location={location}
            status={status}
            departments={departments}
            notes={notes}
          />
        </div>
      </Popup>
    </Marker>
  );
}
