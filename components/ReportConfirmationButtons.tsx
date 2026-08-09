"use client";

import { useReportConfirmation } from "@/lib/useReportConfirmation";
import { useLocale } from "@/lib/i18n/LocaleContext";

interface Props {
  reportId: string;
}

/** 👍/👎 on the last report for a department — lets other visitors flag
 * that it's stale before it ages out on its own. See
 * lib/aggregateStatus.ts's `disputedReportIds` for how a 👎-heavy report
 * feeds back into displayed confidence. */
export function ReportConfirmationButtons({ reportId }: Props) {
  const { t } = useLocale();
  const { voted, busy, vote } = useReportConfirmation(reportId);

  if (voted !== null) {
    return <p className="text-xs text-muted">{t.confirmation.thanks}</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => vote(true)}
        className="min-h-11 rounded-full bg-surface px-3 text-xs text-muted transition-colors duration-200 hover:bg-black/5 disabled:opacity-50"
      >
        👍 {t.confirmation.stillAccurate}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => vote(false)}
        className="min-h-11 rounded-full bg-surface px-3 text-xs text-muted transition-colors duration-200 hover:bg-black/5 disabled:opacity-50"
      >
        👎 {t.confirmation.noLongerAccurate}
      </button>
    </div>
  );
}
