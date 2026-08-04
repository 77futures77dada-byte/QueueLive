const STORAGE_KEY = "queuelive_last_report_at";
export const RATE_LIMIT_MINUTES = 15;

type LastReportMap = Record<string, number>; // location_id -> epoch ms

function readMap(): LastReportMap {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Client-side-only rate limit: a courtesy filter against accidental
 * repeat taps, not a security boundary. A user hitting the Supabase REST
 * API directly bypasses this entirely — see 0001 migration notes for the
 * server-side fallback (Postgres function + RLS check) if abuse shows up. */
export function minutesUntilAllowed(locationId: string): number {
  const lastAt = readMap()[locationId];
  if (!lastAt) return 0;

  const elapsedMinutes = (Date.now() - lastAt) / 60000;
  return Math.max(0, RATE_LIMIT_MINUTES - elapsedMinutes);
}

export function recordReportSubmitted(locationId: string): void {
  const map = readMap();
  map[locationId] = Date.now();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
