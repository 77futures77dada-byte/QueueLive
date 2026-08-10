"use client";

import { useMemo } from "react";
import { useLocationStatuses } from "@/lib/useLocationStatuses";
import { estimateMinutes } from "@/lib/estimateMinutes";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";

const STATUS_DOT_CLASS: Record<AggregatedStatus["status"], string> = {
  low: "bg-status-low",
  medium: "bg-status-medium",
  high: "bg-status-high",
  stale: "bg-muted-bg border border-dashed border-muted",
  "no-data": "bg-muted-bg",
};

// Best-first, so the preview reads as "here's where's actually free" at a
// glance rather than an arbitrary order.
const RANK: Record<AggregatedStatus["status"], number> = {
  low: 0,
  medium: 1,
  high: 2,
  stale: 3,
  "no-data": 4,
};

/** The landing page's "see the value before you click" block — a compact
 * live snapshot of every seeded location's status, using the same
 * aggregation the map itself uses (see lib/useLocationStatuses.ts), so it
 * can never show something the map wouldn't back up a click later. */
export function LandingStatusPreview() {
  const { t } = useLocale();
  const { locations, statusByLocation } = useLocationStatuses();

  const sorted = useMemo(
    () =>
      [...locations].sort(
        (a, b) =>
          RANK[statusByLocation[a.id]?.status ?? "no-data"] -
          RANK[statusByLocation[b.id]?.status ?? "no-data"]
      ),
    [locations, statusByLocation]
  );

  if (sorted.length === 0) return null;

  return (
    <ul className="flex w-full flex-col gap-2">
      {sorted.map((location) => {
        const status = statusByLocation[location.id];
        const minutes = estimateMinutes(status?.status ?? "no-data");
        return (
          <li
            key={location.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-2.5 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[status?.status ?? "no-data"]}`}
              />
              <span className="truncate text-sm font-medium text-ink">{location.name}</span>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink">
              {minutes === null ? t.estimate.none : t.estimate.label(minutes)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
