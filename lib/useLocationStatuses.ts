"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { aggregateStatus, worstStatus, STALE_THRESHOLD_MINUTES } from "@/lib/aggregateStatus";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Department, Location, QueueReport } from "@/types/database";

/** One-shot locations + statuses, for surfaces that just need a snapshot
 * (the landing preview) rather than MapView's full live setup (realtime
 * subscriptions, notes, report-dispute confidence downgrades, selection
 * state). Deliberately lighter than MapView's own data layer — pulling
 * the two all the way together would mean the landing preview drags in
 * realtime channels and note-fetching it doesn't need. */
export function useLocationStatuses() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reports, setReports] = useState<QueueReport[]>([]);
  // A one-shot snapshot, not a ticking clock — this hook is for a landing
  // preview, not a live view, so it doesn't need to re-derive "N min ago"
  // as time passes the way MapView's own `now` state does.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cutoffIso = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60_000).toISOString();
      const [locationsRes, departmentsRes, reportsRes] = await Promise.all([
        supabase.from("locations").select("*"),
        supabase.from("departments").select("*"),
        supabase.from("queue_reports").select("*").gte("created_at", cutoffIso),
      ]);

      if (cancelled) return;
      if (locationsRes.data) setLocations(locationsRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusByLocation = useMemo(() => {
    const departmentsByLocation: Record<string, Department[]> = {};
    for (const d of departments) {
      (departmentsByLocation[d.location_id] ??= []).push(d);
    }

    const reportsByDepartment: Record<string, QueueReport[]> = {};
    const reportsByLocation: Record<string, QueueReport[]> = {};
    for (const r of reports) {
      (reportsByLocation[r.location_id] ??= []).push(r);
      if (r.department_id) (reportsByDepartment[r.department_id] ??= []).push(r);
    }

    const map: Record<string, AggregatedStatus> = {};
    for (const location of locations) {
      const depts = departmentsByLocation[location.id] ?? [];
      map[location.id] =
        depts.length > 0
          ? worstStatus(depts.map((d) => aggregateStatus(reportsByDepartment[d.id] ?? [], now)))
          : aggregateStatus(reportsByLocation[location.id] ?? [], now);
    }
    return map;
  }, [locations, departments, reports, now]);

  return { locations, statusByLocation };
}
