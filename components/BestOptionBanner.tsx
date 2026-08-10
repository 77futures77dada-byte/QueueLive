"use client";

import { distanceMeters } from "@/lib/geo";
import { usePassiveGeolocation } from "@/lib/usePassiveGeolocation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

// Simpler than the sidebar's status sort: free beats busy beats
// unknown/stale, all three of the latter tied for last — "нет данных" isn't
// worse than "долгое ожидание" for this purpose, both just mean "don't
// recommend this over a known-free option".
const RANK: Record<AggregatedStatus["status"], number> = {
  low: 0,
  medium: 1,
  high: 2,
  stale: 2,
  "no-data": 2,
};

interface Props {
  locations: Location[];
  statusByLocation: Record<string, AggregatedStatus>;
}

/** "Best option right now" — only appears if geolocation permission is
 * already granted, checked via the Permissions API and never actively
 * requested from here, so it never nags for access. Ranks by status first
 * (free beats busy beats unknown), distance only breaks ties within a
 * status tier — a free hospital across town still beats a busy one next
 * door. */
export function BestOptionBanner({ locations, statusByLocation }: Props) {
  const { t } = useLocale();
  const userPos = usePassiveGeolocation();

  if (!userPos || locations.length === 0) return null;

  const best = [...locations].sort((a, b) => {
    const rankA = RANK[statusByLocation[a.id]?.status ?? "no-data"];
    const rankB = RANK[statusByLocation[b.id]?.status ?? "no-data"];
    if (rankA !== rankB) return rankA - rankB;
    return distanceMeters(userPos, a) - distanceMeters(userPos, b);
  })[0];

  const distance = distanceMeters(userPos, best);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-primary-tint px-5 py-3">
      <div>
        <p className="text-sm font-semibold text-primary">{t.bestOption.heading(best.name)}</p>
        <p className="text-xs text-muted">{t.bestOption.distanceAway(distance)}</p>
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${best.lat},${best.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-medium text-paper transition-colors duration-200 hover:bg-primary/90"
      >
        {t.location.getDirections}
      </a>
    </div>
  );
}
