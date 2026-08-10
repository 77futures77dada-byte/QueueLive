"use client";

import { useEffect, useState } from "react";

/** Silently picks up the user's position if geolocation permission was
 * already granted — checked via the Permissions API, never actively
 * requested from here. Used anywhere that wants to show a distance
 * without nagging for access (BestOptionBanner, sidebar rows); an
 * explicit "sort by distance" control can still separately call
 * navigator.geolocation.getCurrentPosition() directly to prompt. */
export function usePassiveGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions || !navigator.geolocation) {
      return;
    }
    let cancelled = false;

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (cancelled || status.state !== "granted") return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!cancelled) {
              setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return position;
}
