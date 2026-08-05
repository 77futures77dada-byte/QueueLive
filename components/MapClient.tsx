"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so the map must never render on the server.
// This indirection exists only because `ssr: false` requires a Client
// Component — app/page.tsx stays a Server Component so it can export
// `metadata`.
const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

export function MapClient() {
  return <MapView />;
}
