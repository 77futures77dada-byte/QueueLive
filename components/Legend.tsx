import { t } from "@/lib/i18n";

const ITEMS: { swatchClassName: string; label: string }[] = [
  { swatchClassName: "bg-paper border-2 border-ink", label: t.status.low },
  { swatchClassName: "bg-ink", label: t.status.medium },
  { swatchClassName: "bg-alarm", label: t.status.high },
  { swatchClassName: "bg-muted-bg border-2 border-dashed border-muted", label: t.status.stale },
];

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b-2 border-ink bg-paper px-4 py-2 text-xs font-semibold tracking-wide uppercase">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-3 w-3 shrink-0 ${item.swatchClassName}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
