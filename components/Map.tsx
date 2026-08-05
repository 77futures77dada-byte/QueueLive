"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocationMarker } from "@/components/LocationMarker";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { Location } from "@/types/database";

const TALLINN_CENTER: [number, number] = [59.437, 24.7536];
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 15;

/** Reports the current zoom level up to the parent so markers can switch
 * between the full badge and a plain dot without prop-drilling a Leaflet
 * map instance around. */
function ZoomWatcher({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

/** Flies to + zooms in on a location selected from the sidebar. Leaflet
 * only exposes this imperatively via the map instance, so it has to live
 * inside a child of MapContainer rather than as a prop on it. */
function FlyToSelection({ location }: { location: Location | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), SELECTED_ZOOM));
  }, [location, map]);
  return null;
}

interface Props {
  locations: Location[];
  statusByLocation: Record<string, AggregatedStatus>;
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function Map({
  locations,
  statusByLocation,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <MapContainer
      center={TALLINN_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <ZoomWatcher onZoomChange={setZoom} />
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
          zoom={zoom}
          isSelected={location.id === selectedLocationId}
          onOpen={() => onSelectLocation(location.id)}
        />
      ))}
    </MapContainer>
  );
}
