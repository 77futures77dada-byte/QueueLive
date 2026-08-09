"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Map } from "@/components/Map";
import { Sidebar } from "@/components/Sidebar";
import { BestOptionBanner } from "@/components/BestOptionBanner";
import { LocationDetailSheet } from "@/components/LocationDetailSheet";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { aggregateStatus, worstStatus, STALE_THRESHOLD_MINUTES } from "@/lib/aggregateStatus";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type {
  Department,
  Location,
  LocationNote,
  QueueReport,
  ReportConfirmation,
} from "@/types/database";

const STATUS_REFRESH_MS = 60_000;

/** Owns the shared location/report/note state and the current selection,
 * and lays out the sidebar + map around it. Split out from Map itself so
 * the sidebar and the map markers can stay in sync (clicking a sidebar row
 * opens that marker's popup, and vice versa) without either one owning
 * the data fetching. */
export function MapView() {
  const { t } = useLocale();
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reports, setReports] = useState<QueueReport[]>([]);
  const [confirmations, setConfirmations] = useState<ReportConfirmation[]>([]);
  const [notes, setNotes] = useState<LocationNote[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cutoffIso = new Date(
        Date.now() - STALE_THRESHOLD_MINUTES * 60_000
      ).toISOString();

      const [locationsRes, departmentsRes, reportsRes, confirmationsRes, notesRes] =
        await Promise.all([
          supabase.from("locations").select("*"),
          supabase.from("departments").select("*"),
          supabase
            .from("queue_reports")
            .select("*")
            .gte("created_at", cutoffIso),
          // Small table, no cutoff — a report can only still be within the
          // fetch window above anyway, so its votes are too.
          supabase.from("report_confirmations").select("*"),
          supabase
            .from("location_notes")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (cancelled) return;
      if (locationsRes.data) setLocations(locationsRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (confirmationsRes.data) setConfirmations(confirmationsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recompute statuses periodically so "updated N minutes ago" / staleness
  // advance even when no new reports come in.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), STATUS_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const knownLocationIds = new Set(locations.map((l) => l.id));

    const channel = supabase
      .channel("queue_reports-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queue_reports" },
        (payload) => {
          const report = payload.new as QueueReport;
          // Loaded locations are the current "viewport" for this MVP (a
          // fixed single-city set) — skip anything else to avoid needless
          // re-renders.
          if (!knownLocationIds.has(report.location_id)) return;
          setReports((prev) => [...prev, report]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "location_notes" },
        (payload) => {
          const note = payload.new as LocationNote;
          if (!knownLocationIds.has(note.location_id)) return;
          setNotes((prev) => [note, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "report_confirmations" },
        (payload) => {
          setConfirmations((prev) => [...prev, payload.new as ReportConfirmation]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locations]);

  const departmentsByLocation = useMemo(() => {
    const grouped: Record<string, Department[]> = {};
    for (const department of departments) {
      (grouped[department.location_id] ??= []).push(department);
    }
    return grouped;
  }, [departments]);

  const reportsByDepartment = useMemo(() => {
    const grouped: Record<string, QueueReport[]> = {};
    for (const report of reports) {
      if (!report.department_id) continue;
      (grouped[report.department_id] ??= []).push(report);
    }
    return grouped;
  }, [reports]);

  // Reports without a department_id still count towards the location's own
  // fallback aggregation (used when a location has no departments defined).
  const reportsByLocation = useMemo(() => {
    const grouped: Record<string, QueueReport[]> = {};
    for (const report of reports) {
      (grouped[report.location_id] ??= []).push(report);
    }
    return grouped;
  }, [reports]);

  // Reports whose 👎 votes outnumber their 👍 votes — feeds a one-step
  // confidence downgrade in aggregateStatus even for an otherwise-fresh
  // report (see lib/aggregateStatus.ts).
  const disputedReportIds = useMemo(() => {
    const tally: Record<string, { up: number; down: number }> = {};
    for (const c of confirmations) {
      const t = (tally[c.report_id] ??= { up: 0, down: 0 });
      if (c.vote) t.up += 1;
      else t.down += 1;
    }
    const disputed = new Set<string>();
    for (const [reportId, { up, down }] of Object.entries(tally)) {
      if (down > up) disputed.add(reportId);
    }
    return disputed;
  }, [confirmations]);

  const notesByLocation = useMemo(() => {
    const grouped: Record<string, LocationNote[]> = {};
    for (const note of notes) {
      (grouped[note.location_id] ??= []).push(note);
    }
    return grouped;
  }, [notes]);

  const departmentsWithStatusByLocation = useMemo(() => {
    const map: Record<string, DepartmentWithStatus[]> = {};
    for (const location of locations) {
      map[location.id] = (departmentsByLocation[location.id] ?? []).map((department) => ({
        ...department,
        status: aggregateStatus(reportsByDepartment[department.id] ?? [], now, disputedReportIds),
      }));
    }
    return map;
  }, [locations, departmentsByLocation, reportsByDepartment, now, disputedReportIds]);

  // A hospital's overall status is the worst among its departments — one
  // busy department is enough to flag the whole place. Locations without
  // any departments defined fall back to the old whole-location aggregation.
  const statusByLocation = useMemo(() => {
    const map: Record<string, AggregatedStatus> = {};
    for (const location of locations) {
      const departmentStatuses = departmentsWithStatusByLocation[location.id] ?? [];
      map[location.id] =
        departmentStatuses.length > 0
          ? worstStatus(departmentStatuses.map((d) => d.status))
          : aggregateStatus(reportsByLocation[location.id] ?? [], now, disputedReportIds);
    }
    return map;
  }, [locations, departmentsWithStatusByLocation, reportsByLocation, now, disputedReportIds]);

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);
  const selectedStatus = selectedLocationId ? statusByLocation[selectedLocationId] : undefined;

  return (
    <div className="flex h-full flex-col">
      <BestOptionBanner locations={locations} statusByLocation={statusByLocation} />

      {/* Below md, map and list take turns filling the remaining height
          instead of splitting it 45/45 — on a 375px-tall viewport, half a
          map and half a five-row list are both too cramped to actually
          use. md+ keeps the classic side-by-side layout, tab bar hidden. */}
      <div className="flex min-h-11 shrink-0 border-b border-black/5 bg-paper md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("map")}
          aria-pressed={mobileTab === "map"}
          className={`flex-1 border-b-2 py-2.5 text-sm font-medium ${
            mobileTab === "map" ? "border-primary text-primary" : "border-transparent text-muted"
          }`}
        >
          {t.sidebar.mapTab}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          aria-pressed={mobileTab === "list"}
          className={`flex-1 border-b-2 py-2.5 text-sm font-medium ${
            mobileTab === "list" ? "border-primary text-primary" : "border-transparent text-muted"
          }`}
        >
          {t.sidebar.listTab}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className={`min-h-0 flex-1 md:order-2 md:flex ${mobileTab === "map" ? "flex" : "hidden"}`}
        >
          <Map
            locations={locations}
            statusByLocation={statusByLocation}
            departmentsByLocation={departmentsWithStatusByLocation}
            notesByLocation={notesByLocation}
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />
        </div>
        <div
          className={`min-h-0 flex-1 md:order-1 md:flex md:h-full md:w-[35%] md:shrink-0 ${
            mobileTab === "list" ? "flex" : "hidden"
          }`}
        >
          <Sidebar
            locations={locations}
            statusByLocation={statusByLocation}
            departmentsByLocation={departmentsWithStatusByLocation}
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />
        </div>
      </div>

      <LocationDetailSheet
        location={selectedLocation}
        status={selectedStatus}
        departments={selectedLocationId ? (departmentsWithStatusByLocation[selectedLocationId] ?? []) : []}
        notes={selectedLocationId ? (notesByLocation[selectedLocationId] ?? []) : []}
        onClose={() => setSelectedLocationId(null)}
      />
    </div>
  );
}
