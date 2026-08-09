"use client";

import { useState } from "react";
import { Landing } from "@/components/Landing";
import { MapClient } from "@/components/MapClient";
import { Legend } from "@/components/Legend";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChatWidget } from "@/components/ChatWidget";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function AppShell() {
  const { t } = useLocale();
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-black/5 bg-paper px-4 py-3 shadow-sm sm:px-5 sm:py-4">
        {/* min-w-0 + truncate: appTitle is a single unbroken word in
            Estonian ("Tervishoiujärjekord") that can't wrap, so without
            this it would overflow the header and push the language
            switcher off-screen on a narrow viewport. */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl leading-tight font-semibold text-primary">
            {t.appTitle}
          </h1>
          <p className="mt-1 truncate text-sm text-muted">{t.appTagline}</p>
        </div>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </header>
      <Legend />
      {/* relative + z-0 gives Leaflet's internal panes/controls (which use
          z-index up to 1000) a local stacking context, so that high
          z-index can't leak out and paint over page-level fixed UI like
          the chat launcher. */}
      <main className="relative z-0 flex-1">
        <MapClient />
      </main>
      <ChatWidget />
    </div>
  );
}
