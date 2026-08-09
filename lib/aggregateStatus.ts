import type { LoadLevel, QueueReport } from "@/types/database";

/** Reports older than this are ignored entirely, even for staleness display. */
export const STALE_THRESHOLD_MINUTES = 75;
/** Reports within this window feed the live weighted-median status; beyond
 * it (but still within STALE_THRESHOLD_MINUTES) a location shows as
 * "stale" instead of a computed level. Matches confidence "low"'s upper
 * bound below — past this, the data is too old to call a live status at
 * all, computed or not. */
export const LEVEL_WINDOW_MINUTES = 60;
/** Weight halves every N minutes of report age (exponential recency decay). */
const RECENCY_HALF_LIFE_MINUTES = 10;
/** Window for the "N отметок за час" trust signal shown alongside status. */
export const REPORTS_COUNT_WINDOW_MINUTES = 60;

const LEVEL_SCORE: Record<LoadLevel, number> = { low: 1, medium: 2, high: 3 };
const SCORE_LEVEL: LoadLevel[] = ["low", "medium", "high"]; // index 0 => score 1

/** How much to trust the displayed status, based on the age of the most
 * recent report feeding it (and optionally whether that report has been
 * disputed — see `aggregateStatus`'s `disputedReportIds` param). Separate
 * from `status` itself: a location can show a concrete load level while
 * still flagging that the level might be out of date. */
export type Confidence = "high" | "medium" | "low" | "expired";

const CONFIDENCE_HIGH_MAX_MINUTES = 10;
const CONFIDENCE_MEDIUM_MAX_MINUTES = 30;
// Above this (up to STALE_THRESHOLD_MINUTES), a report is too old to
// compute a level from at all — see LEVEL_WINDOW_MINUTES.

// A disputed report drops confidence one step, but never all the way to
// "expired" — a fresh report that got a couple of 👎 votes should read as
// "could have changed", not "we have no idea".
const DISPUTE_DOWNGRADE: Record<"high" | "medium" | "low", "high" | "medium" | "low"> = {
  high: "medium",
  medium: "low",
  low: "low",
};

export type AggregatedStatus =
  | {
      status: LoadLevel;
      confidence: "high" | "medium" | "low";
      lastReportId: string;
      lastReportAt: string;
      minutesAgo: number;
      peopleCount: number | null;
      reportsLastHour: number;
    }
  | {
      status: "stale";
      confidence: "expired";
      lastReportId: string;
      lastReportAt: string;
      minutesAgo: number;
      peopleCount: number | null;
      reportsLastHour: number;
    }
  | {
      status: "no-data";
      confidence: "expired";
      lastReportId: null;
      lastReportAt: null;
      minutesAgo: null;
      peopleCount: null;
      reportsLastHour: 0;
    };

function ageMinutes(createdAt: string, now: number): number {
  return Math.max(0, (now - new Date(createdAt).getTime()) / 60000);
}

function recencyWeight(minutesOld: number): number {
  return Math.pow(0.5, minutesOld / RECENCY_HALF_LIFE_MINUTES);
}

/** Weighted median load level: sort reports by score, walk cumulative
 * recency weight until it crosses half the total weight. Newer reports
 * count for more, so a single fresh report can outweigh several stale
 * ones near the edge of the window. */
function weightedMedianLevel(reports: QueueReport[], now: number): LoadLevel {
  const scored = reports
    .map((r) => ({
      score: LEVEL_SCORE[r.load_level],
      weight: recencyWeight(ageMinutes(r.created_at, now)),
    }))
    .sort((a, b) => a.score - b.score);

  const totalWeight = scored.reduce((sum, s) => sum + s.weight, 0);
  const half = totalWeight / 2;

  let cumulative = 0;
  for (const s of scored) {
    cumulative += s.weight;
    if (cumulative >= half) {
      return SCORE_LEVEL[Math.round(s.score) - 1];
    }
  }
  return SCORE_LEVEL[SCORE_LEVEL.length - 1];
}

/** Derives a location's display status from its recent reports.
 * `reports` should already be scoped to one location and to at most
 * STALE_THRESHOLD_MINUTES of history (fetch with that cutoff to keep the
 * query cheap — see idx_queue_reports_location_created).
 *
 * `disputedReportIds`: report ids whose 👎 votes outnumber their 👍 votes
 * (see report_confirmations / lib/reportConfirmations.ts). Only the single
 * freshest report matters here — see DISPUTE_DOWNGRADE above. */
export function aggregateStatus(
  reports: QueueReport[],
  now: number = Date.now(),
  disputedReportIds?: Set<string>
): AggregatedStatus {
  if (reports.length === 0) {
    return {
      status: "no-data",
      confidence: "expired",
      lastReportId: null,
      lastReportAt: null,
      minutesAgo: null,
      peopleCount: null,
      reportsLastHour: 0,
    };
  }

  const freshest = reports.reduce((latest, r) =>
    new Date(r.created_at) > new Date(latest.created_at) ? r : latest
  );
  const freshestAgeMinutes = ageMinutes(freshest.created_at, now);

  const reportsLastHour = reports.filter(
    (r) => ageMinutes(r.created_at, now) <= REPORTS_COUNT_WINDOW_MINUTES
  ).length;

  const withinLevelWindow = reports.filter(
    (r) => ageMinutes(r.created_at, now) <= LEVEL_WINDOW_MINUTES
  );

  if (withinLevelWindow.length > 0) {
    let confidence: "high" | "medium" | "low" =
      freshestAgeMinutes < CONFIDENCE_HIGH_MAX_MINUTES
        ? "high"
        : freshestAgeMinutes < CONFIDENCE_MEDIUM_MAX_MINUTES
          ? "medium"
          : "low";

    if (disputedReportIds?.has(freshest.id)) {
      confidence = DISPUTE_DOWNGRADE[confidence];
    }

    return {
      status: weightedMedianLevel(withinLevelWindow, now),
      confidence,
      lastReportId: freshest.id,
      lastReportAt: freshest.created_at,
      minutesAgo: Math.round(freshestAgeMinutes),
      peopleCount: freshest.people_count,
      reportsLastHour,
    };
  }

  return {
    status: "stale",
    confidence: "expired",
    lastReportId: freshest.id,
    lastReportAt: freshest.created_at,
    minutesAgo: Math.round(freshestAgeMinutes),
    peopleCount: freshest.people_count,
    reportsLastHour,
  };
}

const NO_DATA_STATUS: AggregatedStatus = {
  status: "no-data",
  confidence: "expired",
  lastReportId: null,
  lastReportAt: null,
  minutesAgo: null,
  peopleCount: null,
  reportsLastHour: 0,
};

// Concrete, fresh load levels outrank stale data, which in turn outranks
// having no data at all — so a hospital with one busy department but three
// others with no reports still shows as busy, not as "no data".
const STATUS_SEVERITY: Record<AggregatedStatus["status"], number> = {
  high: 4,
  medium: 3,
  low: 2,
  stale: 1,
  "no-data": 0,
};

/** Rolls up several already-aggregated statuses (e.g. one per department)
 * into a single "worst case" status for their parent (e.g. the hospital). */
export function worstStatus(statuses: AggregatedStatus[]): AggregatedStatus {
  if (statuses.length === 0) return NO_DATA_STATUS;

  return statuses.reduce((worst, s) =>
    STATUS_SEVERITY[s.status] > STATUS_SEVERITY[worst.status] ? s : worst
  );
}
