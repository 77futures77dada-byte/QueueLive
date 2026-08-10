"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LandingStatusPreview } from "@/components/LandingStatusPreview";

interface Props {
  onEnter: () => void;
}

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
        {/* The cross reads as part of the wordmark now, not a standalone
            accent — a bare small glyph inline with the text, no colored
            badge box around it. Reference apps in this space lean on the
            map/numbers themselves for the medical feel, not a logo mark. */}
        <div className="flex min-w-0 items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary">
            <rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor" />
            <rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor" />
          </svg>
          <span className="min-w-0 truncate text-sm font-semibold text-primary">
            {t.appTitle}
          </span>
        </div>
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

        {/* Quiet context label, bottom-right — hidden below `sm` since
            there's no safe room to spare at phone widths. */}
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

        {/* max-w caps the column on wide desktops — without it the huge
            amount of side whitespace at 1440px reads as "empty", not
            "spacious". Anchored near the top (not vertically centered)
            with a fixed pt instead: centering in the full remaining
            height was leaving as much dead space above the fold as
            below it, which is exactly the "too much air" the reference
            apps were picked to call out. */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col items-center gap-5 overflow-y-auto px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-12">
          <div className="flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-low opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-low" />
            </span>
            {t.landing.live}
          </div>

          <div>
            {/* The direct question, not the product name, is the headline
                now — appTitle already lives in the header. */}
            <h1 className="text-4xl font-bold text-primary">{t.landing.headline}</h1>
            <p className="mt-2 text-sm text-muted">{t.landing.trustNote}</p>
            {/* A visible "0" would read as "nobody's here" — worse than saying
                nothing at all, so the block only shows once it has something
                to say. */}
            {todayCount !== null && todayCount > 0 && (
              <p className="mt-2 text-sm font-medium text-primary">
                {t.landing.todayCount(todayCount)}
              </p>
            )}
          </div>

          {/* The value itself, visible before any click — a live snapshot
              of every location's status, same data the map shows. */}
          <LandingStatusPreview />

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
