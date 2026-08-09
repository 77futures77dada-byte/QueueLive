"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LocationMarker } from "@/components/LocationMarker";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationNote } from "@/types/database";

const TALLINN_CENTER: [number, number] = [59.437, 24.7536];
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 15;

/** Leaflet reads its container's size once at construction and otherwise
 * only reacts to `window` resize events. It doesn't notice when its own
 * container changes size for other reasons — a flex reflow from sidebar
 * content loading in, or (once this map is mounted behind a landing
 * screen) simply not being laid out yet at the instant it's created. A
 * stale size shows up as a map rendered into a tiny clipped corner. A
 * ResizeObserver on the container catches all of those. */
function AutoInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [map]);
  return null;
}

/** Flies to + zooms in on a location selected from the sidebar or from
 * clicking its own marker. Leaflet only exposes this imperatively via the
 * map instance, so it has to live inside a child of MapContainer rather
 * than as a prop on it.
 *
 * Centering dead-center would put the marker in the middle of the
 * container, leaving only ~half the container's height for a popup that
 * opens upward from it — not enough once the popup grew to include a
 * per-department report list, and it fights with Leaflet's own popup
 * auto-pan (both try to reposition the map at once). Biasing the target
 * downward instead leaves comfortable headroom above the marker for the
 * popup. */
function FlyToSelection({ location }: { location: Location | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    const targetZoom = Math.max(map.getZoom(), SELECTED_ZOOM);
    const targetPoint = map.project([location.lat, location.lng], targetZoom);
    const verticalBias = map.getSize().y * 0.18;
    const centerLatLng = map.unproject(targetPoint.subtract([0, verticalBias]), targetZoom);
    map.flyTo(centerLatLng, targetZoom);
  }, [location, map]);
  return null;
}

interface Props {
  locations: Location[];
  statusByLocation: Record<string, AggregatedStatus>;
  departmentsByLocation: Record<string, DepartmentWithStatus[]>;
  notesByLocation: Record<string, LocationNote[]>;
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function Map({
  locations,
  statusByLocation,
  departmentsByLocation,
  notesByLocation,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <MapContainer
      center={TALLINN_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <AutoInvalidateSize />
      <FlyToSelection location={selectedLocation} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          status={statusByLocation[location.id]}
          departments={departmentsByLocation[location.id] ?? []}
          notes={notesByLocation[location.id] ?? []}
          isSelected={location.id === selectedLocationId}
          onOpen={() => onSelectLocation(location.id)}
        />
      ))}
    </MapContainer>
  );
}
