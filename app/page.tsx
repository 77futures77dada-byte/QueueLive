import { MapClient } from "@/components/MapClient";
import { Legend } from "@/components/Legend";
import { t } from "@/lib/i18n";

export default function Home() {
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
