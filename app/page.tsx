import { MapClient } from "@/components/MapClient";
import { Legend } from "@/components/Legend";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-ink px-4 py-3 text-paper">
        <h1 className="text-3xl leading-none font-bold tracking-tight uppercase">
          {t.appTitle}
        </h1>
        <p className="mt-1 text-xs font-semibold tracking-widest uppercase">
          {t.appTagline}
        </p>
      </header>
      <Legend />
      <main className="flex-1">
        <MapClient />
      </main>
    </div>
  );
}
