"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export function Legend() {
  const { t } = useLocale();
  const ITEMS: { swatchClassName: string; label: string }[] = [
    { swatchClassName: "bg-status-low", label: t.status.low },
    { swatchClassName: "bg-status-medium", label: t.status.medium },
    { swatchClassName: "bg-status-high", label: t.status.high },
    { swatchClassName: "bg-muted-bg border border-dashed border-muted", label: t.status.stale },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-paper px-5 py-2.5 text-sm text-ink">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-3 w-3 shrink-0 rounded-full ${item.swatchClassName}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
