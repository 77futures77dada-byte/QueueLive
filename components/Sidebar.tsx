"use client";

import { useMemo, useState } from "react";
import { DepartmentReportList } from "@/components/DepartmentReportList";
import { distanceMeters } from "@/lib/geo";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
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
  departmentsByLocation: Record<string, DepartmentWithStatus[]>;
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function Sidebar({
  locations,
  statusByLocation,
  departmentsByLocation,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const { t } = useLocale();
  const [sortMode, setSortMode] = useState<SortMode>("status");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);

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
    const normalizedQuery = query.trim().toLowerCase();
    const list = normalizedQuery
      ? locations.filter((l) => l.name.toLowerCase().includes(normalizedQuery))
      : [...locations];

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
  }, [locations, sortMode, userPos, statusByLocation, query]);

  return (
    <aside className="flex h-full w-full flex-col bg-paper md:border-r md:border-black/5">
      <div className="border-b border-black/5 px-4 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.sidebar.searchPlaceholder}
          className="min-h-11 w-full rounded-full bg-surface px-4 text-base text-ink placeholder:text-muted focus:outline-primary"
        />
      </div>

      <div className="flex gap-2 border-b border-black/5 px-4 py-3">
        <button
          type="button"
          onClick={() => setSortMode("status")}
          className={`min-h-11 rounded-full px-3 text-xs font-medium transition-colors duration-200 ${
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
          className={`min-h-11 rounded-full px-3 text-xs font-medium transition-colors duration-200 ${
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

      {sorted.length === 0 && (
        <p className="px-4 py-3 text-sm text-muted">{t.sidebar.noResults}</p>
      )}

      <ul className="flex-1 divide-y divide-black/5 overflow-y-auto">
        {sorted.map((location) => {
          const status = statusByLocation[location.id];
          const isSelected = location.id === selectedLocationId;
          const isExpanded = location.id === expandedLocationId;
          const departments = departmentsByLocation[location.id] ?? [];
          return (
            <li key={location.id} className={isSelected ? "bg-primary-tint" : ""}>
              <div className="flex items-start">
                <button
                  type="button"
                  onClick={() => onSelectLocation(location.id)}
                  className="block w-full px-4 py-3 text-left"
                >
                  <p className="text-sm font-semibold text-ink">{location.name}</p>
                  <p className="text-xs text-muted">{t.locationType[location.type]}</p>
                  <div className={status.confidence === "low" ? "opacity-60" : undefined}>
                    <p className="mt-1 text-sm">
                      <span className={`font-medium ${STATUS_TEXT_CLASS[status.status]}`}>
                        {t.status[status.status]}
                      </span>
                      {status.confidence === "medium" && (
                        <span className="ml-1 text-xs text-muted">🕒</span>
                      )}
                      <span className="text-muted">
                        {" · "}
                        {status.minutesAgo === null
                          ? t.report.neverReported
                          : t.report.updatedAgo(status.minutesAgo)}
                      </span>
                    </p>
                    {status.confidence === "low" && (
                      <p className="text-xs font-medium text-status-medium">
                        {t.confidence.lowNote}
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      {t.report.reportsCountLastHour(status.reportsLastHour)}
                    </p>
                  </div>
                </button>
                {departments.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLocationId(isExpanded ? null : location.id);
                    }}
                    aria-expanded={isExpanded}
                    aria-label={t.sidebar.showDepartments}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted hover:text-primary"
                  >
                    <span
                      aria-hidden
                      className={`inline-block transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                )}
              </div>
              {isExpanded && departments.length > 0 && (
                <div className="px-4 pb-3">
                  <DepartmentReportList location={location} departments={departments} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
