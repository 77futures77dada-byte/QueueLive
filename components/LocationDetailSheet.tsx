"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LocationDetailContent } from "@/components/LocationDetailContent";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { AggregatedStatus } from "@/lib/aggregateStatus";
import type { DepartmentWithStatus } from "@/components/DepartmentReportList";
import type { Location, LocationNote } from "@/types/database";

interface Props {
  location: Location | undefined;
  status: AggregatedStatus | undefined;
  departments: DepartmentWithStatus[];
  notes: LocationNote[];
  onClose: () => void;
}

/** Mobile counterpart to LocationMarker's desktop popup — a full-width
 * panel sliding up from the bottom edge, the standard pattern for map
 * details on a touch screen (Google Maps, Waze) rather than a small popup
 * pinned to the tapped marker, which is fiddly to read and tap on a phone.
 * Hidden entirely on md+ (see globals.css, which hides the real Leaflet
 * popup below md and lets this take over instead).
 *
 * Rendered via a portal into document.body rather than in place: this
 * component lives inside MapView, which lives inside <main
 * className="relative z-0 ...">, a stacking context deliberately set up
 * to contain Leaflet's internal panes/controls (z-index up to 1000). That
 * containment would also trap a fixed-position child of MapView — its
 * viewport position would be correct but Leaflet's own layers would still
 * paint over it, the same bug class that once hid the chat launcher.
 * Portaling to body sidesteps the trap entirely instead of relying on a
 * z-index high enough to out-rank Leaflet from inside its own context. */
export function LocationDetailSheet({ location, status, departments, notes, onClose }: Props) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  // document.body doesn't exist during SSR, so the portal can only target
  // it after the first client render — this one-time sync-on-mount is the
  // standard exception to "don't setState in an effect".
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!location || !status || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label={t.location.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="sheet-slide-up absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-2xl bg-paper shadow-2xl">
        <div className="flex shrink-0 items-center justify-center pt-2">
          <span aria-hidden className="h-1 w-10 rounded-full bg-black/10" />
        </div>
        <div className="flex shrink-0 items-center justify-end px-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.location.close}
            className="flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-6">
          <LocationDetailContent
            location={location}
            status={status}
            departments={departments}
            notes={notes}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
