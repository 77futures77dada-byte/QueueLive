"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface Props {
  onEnter: () => void;
}

// Small, literal glyphs for the three "how it works" cards — the copy
// itself is locale-driven text with no icon metadata, so these are matched
// to each point by position, not translated.
const POINT_ICONS = [
  <svg
    key="pin"
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>,
  <svg
    key="check"
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>,
  <svg
    key="heart"
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M12 20s-7-4.35-9-8.5C1.5 8 3 5 6 5c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 3 0 4.5 3 3 6.5C19 15.65 12 20 12 20z" />
  </svg>,
];

export function Landing({ onEnter }: Props) {
  const { t } = useLocale();
  const [todayCount, setTodayCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTodayCount() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("queue_reports")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString());

      if (!cancelled) setTodayCount(count ?? 0);
    }

    loadTodayCount();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-surface">
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="min-w-0 truncate text-sm font-semibold text-primary">
          {t.appTitle}
        </span>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Decorative layer starts below the header (not the full viewport),
          so the corner elements can never land under the language switcher
          — and `overflow-hidden` here means they're clipped to this box at
          any screen size instead of escaping it, which is what broke the
          old single giant background shape. */}
      <div className="relative flex-1 overflow-hidden">
        {/* Very light dot-grid texture — a repeating CSS pattern instead of
            one large SVG, so it tiles cleanly at any viewport instead of
            needing to be sized/scaled itself. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(var(--ink) 1px, transparent 1px)",
            backgroundSize: "1.5rem 1.5rem",
          }}
        />

        {/* Small tilted cross accent, corner-anchored — not a full-bleed
            watermark. Hidden below `sm` since there's no room to spare
            next to the header at phone widths. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-4 right-4 hidden h-10 w-10 rotate-[10deg] text-red-600 sm:right-6 sm:block sm:h-12 sm:w-12"
        >
          <rect x="10" y="2" width="4" height="20" rx="1" fill="currentColor" />
          <rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" />
        </svg>

        {/* Quiet context label, bottom-right — same breakpoint guard as the
            cross above, for the same reason. */}
        <div className="pointer-events-none absolute right-4 bottom-4 hidden items-center gap-1 text-xs text-muted sm:right-6 sm:flex">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {t.landing.cityLabel}
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-4 py-8 text-center sm:px-6">
          <div className="flex flex-col items-center gap-5">
            {/* "Live" pill instead of a static badge above the heading —
                signals an actively-updating page rather than just being
                decorative. */}
            <div className="flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-low opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-low" />
              </span>
              {t.landing.live}
            </div>

            <div>
              <h1 className="text-[clamp(2rem,8vw,3.5rem)] leading-tight font-bold text-primary">
                {t.appTitle}
              </h1>
              <p className="mt-3 text-base font-medium text-muted">{t.appTagline}</p>
              <p className="mt-1 text-sm text-muted">{t.landing.trustNote}</p>
              {/* A visible "0" would read as "nobody's here" — worse than saying
                  nothing at all, so the block only shows once it has something
                  to say. */}
              {todayCount !== null && todayCount > 0 && (
                <p className="mt-3 text-sm font-medium text-primary">
                  {t.landing.todayCount(todayCount)}
                </p>
              )}
            </div>
          </div>

          <ul className="flex w-full max-w-md flex-col gap-3">
            {t.landing.points.map((point, i) => (
              <li
                key={point}
                className="flex items-center gap-3 rounded-xl bg-paper p-3.5 text-left shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                  {POINT_ICONS[i]}
                </span>
                <span className="text-sm leading-snug text-ink">{point}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onEnter}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-paper transition-colors duration-200 hover:bg-primary/90"
          >
            {t.landing.cta}
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
