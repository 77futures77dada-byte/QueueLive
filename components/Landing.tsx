"use client";

import { t } from "@/lib/i18n";

interface Props {
  onEnter: () => void;
}

export function Landing({ onEnter }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between bg-surface px-6 py-12 text-center">
      <div />

      <div className="flex max-w-md flex-col items-center gap-8">
        <div>
          <h1 className="text-4xl leading-tight font-semibold text-primary">
            {t.appTitle}
          </h1>
          <p className="mt-3 text-base text-muted">{t.appTagline}</p>
          <p className="mt-1 text-sm text-muted">{t.landing.trustNote}</p>
        </div>

        <ul className="flex flex-col gap-3 text-ink">
          {t.landing.points.map((point) => (
            <li key={point} className="text-base leading-snug">
              {point}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-paper transition-colors duration-200 hover:bg-primary/90"
      >
        {t.landing.cta}
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
