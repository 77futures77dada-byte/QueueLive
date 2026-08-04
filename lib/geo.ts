const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in meters. */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export const GEO_CHECK_TOLERANCE_M = 200;

export type GeoCheckResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "denied" | "too_far"; distanceM?: number };

/** Confirms the browser's current position is within tolerance of a
 * location. This is a sanity filter against accidental mis-taps, not a
 * defense against a user deliberately spoofing geolocation. */
export function checkNearLocation(
  target: { lat: number; lng: number },
  tolerance = GEO_CHECK_TOLERANCE_M
): Promise<GeoCheckResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, reason: "unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distanceM = distanceMeters(target, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        if (distanceM <= tolerance) {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, reason: "too_far", distanceM });
        }
      },
      () => resolve({ ok: false, reason: "denied" }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}
