"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { ReportButtons } from "@/components/ReportButtons";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

// Status reads through color + opacity on a familiar medical-pin shape, not
// size — a pin that visibly grows with "how bad" reads as alarming, which
// runs against the calm, trustworthy tone this needs for someone already
// stressed about an injury.
const STATUS_FILL: Record<AggregatedStatus["status"], string> = {
  low: "var(--status-low)",
  medium: "var(--status-medium)",
  high: "var(--status-high)",
  stale: "var(--muted)",
  "no-data": "var(--muted)",
};

const PIN_WIDTH = 30;
const PIN_HEIGHT = 38;

function buildIcon(status: AggregatedStatus["status"]) {
  const fill = STATUS_FILL[status];
  const isFaded = status === "stale" || status === "no-data";
  const opacity = isFaded ? 0.55 : 1;
  const pulseRing =
    status === "high"
      ? `<circle class="marker-pulse-ring" cx="15" cy="15" r="9" fill="${fill}"></circle>`
      : "";

  const html = `
    <svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(51,50,46,0.3))">
      ${pulseRing}
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.716 23.284 0 15 0z" fill="${fill}" opacity="${opacity}" />
      <circle cx="15" cy="15" r="7" fill="white" opacity="${opacity}" />
      <rect x="12.5" y="10.5" width="5" height="9" rx="1.5" fill="${fill}" opacity="${opacity}" />
      <rect x="10.5" y="12.5" width="9" height="5" rx="1.5" fill="${fill}" opacity="${opacity}" />
    </svg>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
    popupAnchor: [0, -PIN_HEIGHT + 4],
  });
}

interface Props {
  location: Location;
  status: AggregatedStatus;
}

export function LocationMarker({ location, status }: Props) {
  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={buildIcon(status.status)}
    >
      <Popup minWidth={260}>
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-base leading-snug font-semibold text-ink">
              {location.name}
            </p>
            <p className="text-sm text-muted">{t.locationType[location.type]}</p>
          </div>

          <p className="rounded-xl bg-primary-tint px-3 py-2 text-sm text-ink">
            <span className="font-semibold">{t.status[status.status]}</span>
            <span className="block text-xs text-muted">
              {status.minutesAgo === null
                ? t.report.neverReported
                : t.report.updatedAgo(status.minutesAgo)}
            </span>
          </p>

          <ReportButtons location={location} />
        </div>
      </Popup>
    </Marker>
  );
}
