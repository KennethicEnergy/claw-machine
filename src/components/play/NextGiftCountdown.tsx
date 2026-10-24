"use client";

import { msUntilNextDay } from "@/game/daily";
import { useNow } from "@/hooks/useNow";
import { formatCountdown } from "@/lib/formatCountdown";

const REFRESH_MS = 30_000;

/** Time left until midnight, when the next gift unlocks. */
export const NextGiftCountdown = () => {
  const now = useNow(REFRESH_MS);
  return <>{formatCountdown(msUntilNextDay(new Date(now)))}</>;
};
