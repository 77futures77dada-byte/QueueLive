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
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="min-w-0 truncate text-sm font-semibold text-primary">
          {t.appTitle}
        </span>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 text-center sm:px-6">
        <div className="flex flex-col items-center gap-5">
          {/* A small, static app badge — not a full-screen background
              watermark. Fixed-looking size, but built from rem-based
              Tailwind spacing so it still scales with the user's base
              font size rather than a hardcoded px value. */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm sm:h-20 sm:w-20">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-paper sm:h-10 sm:w-10"
            >
              <rect x="10" y="3" width="4" height="18" rx="1" fill="currentColor" />
              <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" />
            </svg>
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
  );
}
