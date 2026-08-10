"use client";

import { useMemo, useState } from "react";
import { DepartmentReportList } from "@/components/DepartmentReportList";
import { distanceMeters } from "@/lib/geo";
import { estimateMinutes } from "@/lib/estimateMinutes";
import { usePassiveGeolocation } from "@/lib/usePassiveGeolocation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationType } from "@/types/database";

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

// Small facility-type glyphs for the list rows — a scannable icon next to
// the name, per the list+map reference this layout is following.
const TYPE_ICON: Record<LocationType, React.ReactNode> = {
  hospital: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  clinic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-7h6v7" />
    </svg>
  ),
  mfc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
  post: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
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
  // Seeded passively (no prompt) if permission was already granted, so
  // distance can show on cards immediately; the explicit button below can
  // still prompt for it if not.
  const passivePos = usePassiveGeolocation();
  const [explicitPos, setExplicitPos] = useState<{ lat: number; lng: number } | null>(null);
  const userPos = explicitPos ?? passivePos;
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
      (pos) => setExplicitPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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
          const minutes = estimateMinutes(status.status);
          const distance = userPos ? distanceMeters(userPos, location) : null;

          return (
            <li key={location.id} className={isSelected ? "bg-primary-tint" : ""}>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectLocation(location.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
                >
                  <span aria-hidden className="shrink-0 text-muted">
                    {TYPE_ICON[location.type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold text-ink ${status.confidence === "low" ? "opacity-60" : ""}`}>
                      {location.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {status.confidence === "medium" && "🕒 "}
                      {status.confidence === "low"
                        ? t.confidence.lowNote
                        : status.minutesAgo === null
                          ? t.report.neverReported
                          : t.report.updatedAgo(status.minutesAgo)}
                    </span>
                  </span>
                  {/* Time estimate and distance are the two numbers that
                      actually decide "where do I go" — kept big and
                      unambiguous, everything else on the row is secondary. */}
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className={`text-lg leading-none font-bold ${STATUS_TEXT_CLASS[status.status]}`}>
                      {minutes === null ? t.estimate.none : t.estimate.label(minutes)}
                    </span>
                    {distance !== null && (
                      <span className="text-xs font-medium text-muted">
                        {t.bestOption.distanceAway(distance)}
                      </span>
                    )}
                  </span>
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
