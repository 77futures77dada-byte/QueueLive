"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { supabase } from "@/lib/supabase";
import { LocationMarker } from "@/components/LocationMarker";
import { aggregateStatus, STALE_THRESHOLD_MINUTES } from "@/lib/aggregateStatus";
import type { Location, QueueReport } from "@/types/database";

const TALLINN_CENTER: [number, number] = [59.437, 24.7536];
const STATUS_REFRESH_MS = 60_000;

export function Map() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [reports, setReports] = useState<QueueReport[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cutoffIso = new Date(
        Date.now() - STALE_THRESHOLD_MINUTES * 60_000
      ).toISOString();

      const [locationsRes, reportsRes] = await Promise.all([
        supabase.from("locations").select("*"),
        supabase
          .from("queue_reports")
          .select("*")
          .gte("created_at", cutoffIso),
      ]);

      if (cancelled) return;
      if (locationsRes.data) setLocations(locationsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locations]);

  const reportsByLocation = useMemo(() => {
    const grouped: Record<string, QueueReport[]> = {};
    for (const report of reports) {
      (grouped[report.location_id] ??= []).push(report);
    }
    return grouped;
  }, [reports]);

  return (
    <MapContainer
      center={TALLINN_CENTER}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          status={aggregateStatus(reportsByLocation[location.id] ?? [], now)}
        />
      ))}
    </MapContainer>
  );
}
