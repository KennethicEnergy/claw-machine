import { useEffect, useState } from "react";
import { dayKey, msUntilNextDay } from "@/game/daily";

/** Today's local day key; updates at midnight and when a sleeping phone wakes the tab. */
export const useToday = () => {
  const [today, setToday] = useState(() => dayKey(new Date()));

  useEffect(() => {
    const refresh = () => setToday(dayKey(new Date()));
    const timer = window.setTimeout(refresh, msUntilNextDay(new Date()) + 1000);
    const handleVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [today]);

  return today;
};
