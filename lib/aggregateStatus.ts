import type { LoadLevel, QueueReport } from "@/types/database";

/** Reports older than this are ignored entirely, even for staleness display. */
export const STALE_THRESHOLD_MINUTES = 75;
/** Window used to compute the live weighted-median status. */
export const RECENT_WINDOW_MINUTES = 30;
/** Weight halves every N minutes of report age (exponential recency decay). */
const RECENCY_HALF_LIFE_MINUTES = 10;
/** Window for the "N отметок за час" trust signal shown alongside status. */
export const REPORTS_COUNT_WINDOW_MINUTES = 60;

const LEVEL_SCORE: Record<LoadLevel, number> = { low: 1, medium: 2, high: 3 };
const SCORE_LEVEL: LoadLevel[] = ["low", "medium", "high"]; // index 0 => score 1

export type AggregatedStatus =
  | {
      status: LoadLevel;
      lastReportAt: string;
      minutesAgo: number;
      peopleCount: number | null;
      reportsLastHour: number;
    }
  | {
      status: "stale";
      lastReportAt: string;
      minutesAgo: number;
      peopleCount: number | null;
      reportsLastHour: number;
    }
  | {
      status: "no-data";
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
 * query cheap — see idx_queue_reports_location_created). */
export function aggregateStatus(
  reports: QueueReport[],
  now: number = Date.now()
): AggregatedStatus {
  if (reports.length === 0) {
    return {
      status: "no-data",
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

  const recent = reports.filter(
    (r) => ageMinutes(r.created_at, now) <= RECENT_WINDOW_MINUTES
  );

  if (recent.length > 0) {
    return {
      status: weightedMedianLevel(recent, now),
      lastReportAt: freshest.created_at,
      minutesAgo: Math.round(freshestAgeMinutes),
      peopleCount: freshest.people_count,
      reportsLastHour,
    };
  }

  return {
    status: "stale",
    lastReportAt: freshest.created_at,
    minutesAgo: Math.round(freshestAgeMinutes),
    peopleCount: freshest.people_count,
    reportsLastHour,
  };
}
