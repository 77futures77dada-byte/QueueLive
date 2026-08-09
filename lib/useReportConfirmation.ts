"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";

const UNIQUE_VIOLATION = "23505";

/** 👍/👎 vote on a specific report's `id`. One vote per device per report,
 * enforced by a unique constraint on the server — a duplicate insert is
 * treated the same as a fresh vote from the UI's perspective, since either
 * way there's nothing left for this device to do. */
export function useReportConfirmation(reportId: string) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function vote(value: boolean) {
    if (busy || voted !== null) return;
    setBusy(true);

    const { error } = await supabase.from("report_confirmations").insert({
      report_id: reportId,
      device_id: getDeviceId(),
      vote: value,
    });

    setBusy(false);
    if (!error || error.code === UNIQUE_VIOLATION) {
      setVoted(value);
    }
  }

  return { voted, busy, vote };
}
