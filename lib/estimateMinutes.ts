import type { AggregatedStatus } from "@/lib/aggregateStatus";

// Rough, round-number translation of a load level into a headline minute
// estimate — the app has never collected an actual measured wait time (no
// UI writes queue_reports.people_count), so this is deliberately a fixed,
// honest category mapping rather than invented precision. Shared by the
// map pill marker, sidebar rows, and the landing status preview so the
// three surfaces can't disagree with each other.
const ESTIMATE_MINUTES: Record<"low" | "medium" | "high", number> = {
  low: 10,
  medium: 30,
  high: 60,
};

export function estimateMinutes(status: AggregatedStatus["status"]): number | null {
  if (status === "low" || status === "medium" || status === "high") {
    return ESTIMATE_MINUTES[status];
  }
  return null;
}
