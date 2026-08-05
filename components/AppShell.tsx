"use client";

import { useState } from "react";
import { Landing } from "@/components/Landing";
import { MapClient } from "@/components/MapClient";
import { Legend } from "@/components/Legend";
import { t } from "@/lib/i18n";

export function AppShell() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/5 bg-paper px-5 py-4 shadow-sm">
        <h1 className="text-2xl leading-tight font-semibold text-primary">
          {t.appTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.appTagline}</p>
      </header>
      <Legend />
      <main className="flex-1">
        <MapClient />
      </main>
    </div>
  );
}
