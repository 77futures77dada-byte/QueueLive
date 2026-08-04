"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { ReportButtons } from "@/components/ReportButtons";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

// Alarm state grows the mark physically — more people, more square. Size
// is the primary signal; color backs it up for anyone colorblind to red.
const MARKER_STYLE: Record<
  AggregatedStatus["status"],
  { size: number; className: string }
> = {
  low: { size: 16, className: "bg-paper border-2 border-ink" },
  medium: { size: 22, className: "bg-ink" },
  high: { size: 32, className: "bg-alarm marker-alarm" },
  stale: { size: 12, className: "bg-muted-bg border-2 border-dashed border-muted" },
  "no-data": { size: 10, className: "bg-muted-bg border-2 border-dashed border-muted" },
};

function buildIcon(status: AggregatedStatus["status"]) {
  const { size, className } = MARKER_STYLE[status];
  return L.divIcon({
    html: `<div class="${className}" style="width:${size}px;height:${size}px"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
      <Popup minWidth={240}>
        <div className="flex flex-col gap-3 p-3 font-mono">
          <div>
            <p className="text-base leading-tight font-bold uppercase">
              {location.name}
            </p>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {t.locationType[location.type]}
            </p>
          </div>

          <p className="border-2 border-ink px-2 py-1 text-sm font-bold uppercase">
            {t.status[status.status]}
            <span className="block text-xs font-semibold normal-case">
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
