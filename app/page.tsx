import { MapClient } from "@/components/MapClient";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 px-4 py-3">
        <h1 className="text-lg font-semibold">{t.appTitle}</h1>
        <p className="text-sm text-gray-500">{t.appTagline}</p>
      </header>
      <main className="flex-1">
        <MapClient />
      </main>
    </div>
  );
}
