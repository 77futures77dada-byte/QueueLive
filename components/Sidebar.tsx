"use client";

import { useMemo, useState } from "react";
import { ReportButtonsCompact } from "@/components/ReportButtonsCompact";
import { distanceMeters } from "@/lib/geo";
import { t } from "@/lib/i18n";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

// Ascending "how good is this option" — free first, unknowns last. Known-bad
// still beats no information at all when someone is deciding where to go.
const STATUS_RANK: Record<AggregatedStatus["status"], number> = {
  low: 0,
  medium: 1,
  high: 2,
  stale: 3,
  "no-data": 4,
};

const STATUS_TEXT_CLASS: Record<AggregatedStatus["status"], string> = {
  low: "text-status-low",
  medium: "text-status-medium",
  high: "text-status-high",
  stale: "text-muted",
  "no-data": "text-muted",
};

type SortMode = "status" | "distance";

interface Props {
  locations: Location[];
  statusByLocation: Record<string, AggregatedStatus>;
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function Sidebar({
  locations,
  statusByLocation,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const [sortMode, setSortMode] = useState<SortMode>("status");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState(false);

  function handleSortByDistance() {
    setSortMode("distance");
    setGeoError(false);
    if (userPos || typeof navigator === "undefined" || !navigator.geolocation) {
      if (!navigator.geolocation) setGeoError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  const sorted = useMemo(() => {
    const list = [...locations];
    if (sortMode === "distance" && userPos) {
      list.sort((a, b) => distanceMeters(userPos, a) - distanceMeters(userPos, b));
    } else {
      list.sort((a, b) => {
        const rankA = STATUS_RANK[statusByLocation[a.id]?.status ?? "no-data"];
        const rankB = STATUS_RANK[statusByLocation[b.id]?.status ?? "no-data"];
        return rankA - rankB;
      });
    }
    return list;
  }, [locations, sortMode, userPos, statusByLocation]);

  return (
    <aside className="flex h-full w-full flex-col bg-paper md:w-80 md:shrink-0 md:border-r md:border-black/5">
      <div className="flex gap-2 border-b border-black/5 px-4 py-3">
        <button
          type="button"
          onClick={() => setSortMode("status")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
            sortMode === "status"
              ? "bg-primary text-paper"
              : "bg-primary-tint text-primary hover:bg-primary-tint/70"
          }`}
        >
          {t.sidebar.sortByStatus}
        </button>
        <button
          type="button"
          onClick={handleSortByDistance}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
            sortMode === "distance"
              ? "bg-primary text-paper"
              : "bg-primary-tint text-primary hover:bg-primary-tint/70"
          }`}
        >
          {t.sidebar.sortByDistance}
        </button>
      </div>

      {sortMode === "distance" && geoError && (
        <p className="px-4 py-2 text-xs text-status-high">{t.sidebar.distanceUnavailable}</p>
      )}

      <ul className="flex-1 divide-y divide-black/5 overflow-y-auto">
        {sorted.map((location) => {
          const status = statusByLocation[location.id];
          const isSelected = location.id === selectedLocationId;
          return (
            <li key={location.id} className={isSelected ? "bg-primary-tint" : ""}>
              <button
                type="button"
                onClick={() => onSelectLocation(location.id)}
                className="block w-full px-4 py-3 text-left"
              >
                <p className="text-sm font-semibold text-ink">{location.name}</p>
                <p className="text-xs text-muted">{t.locationType[location.type]}</p>
                <p className="mt-1 text-sm">
                  <span className={`font-medium ${STATUS_TEXT_CLASS[status.status]}`}>
                    {t.status[status.status]}
                  </span>
                  <span className="text-muted">
                    {" · "}
                    {status.minutesAgo === null
                      ? t.report.neverReported
                      : t.report.updatedAgo(status.minutesAgo)}
                  </span>
                </p>
              </button>
              <div className="px-4 pb-3">
                <ReportButtonsCompact location={location} />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
