"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { ReportButtons } from "@/components/ReportButtons";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

const STATUS_COLOR: Record<AggregatedStatus["status"], string> = {
  low: "#16a34a",
  medium: "#eab308",
  high: "#dc2626",
  stale: "#9ca3af",
  "no-data": "#9ca3af",
};

interface Props {
  location: Location;
  status: AggregatedStatus;
}

export function LocationMarker({ location, status }: Props) {
  const isFaded = status.status === "stale" || status.status === "no-data";

  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={10}
      pathOptions={{
        color: STATUS_COLOR[status.status],
        fillColor: STATUS_COLOR[status.status],
        fillOpacity: isFaded ? 0.35 : 0.85,
        opacity: isFaded ? 0.5 : 1,
        weight: 2,
      }}
    >
      <Popup>
        <div className="flex min-w-[200px] flex-col gap-2">
          <div>
            <p className="font-semibold leading-tight">{location.name}</p>
            <p className="text-xs text-gray-500">{t.locationType[location.type]}</p>
          </div>

          <p className="text-sm">
            <span className="font-medium">{t.status[status.status]}</span>
            {" — "}
            {status.minutesAgo === null
              ? t.report.neverReported
              : t.report.updatedAgo(status.minutesAgo)}
          </p>

          <ReportButtons location={location} />
        </div>
      </Popup>
    </CircleMarker>
  );
}
