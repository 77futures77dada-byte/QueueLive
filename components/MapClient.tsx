"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so the map must never render on the server.
// This indirection exists only because `ssr: false` requires a Client
// Component — app/page.tsx stays a Server Component so it can export
// `metadata`.
const Map = dynamic(() => import("@/components/Map").then((mod) => mod.Map), {
  ssr: false,
});

export function MapClient() {
  return <Map />;
}
