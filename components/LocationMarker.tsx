"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import { LocationDetailContent } from "@/components/LocationDetailContent";
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

/** The marker + its desktop popup. Below md, the popup is hidden via CSS
 * (see globals.css) and LocationDetailSheet shows the same content as a
 * bottom sheet instead — see that component for why. */
export function LocationMarker({ location, status, departments, notes, isSelected, onOpen }: Props) {
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
