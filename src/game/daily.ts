const pad = (value: number) => String(value).padStart(2, "0");

/** Local calendar day, e.g. "2026-02-14". Days roll over at her local midnight. */
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const msUntilNextDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() -
  date.getTime();

/** How many gifts were collected on `day`. */
export const claimsOn = (collectedDays: Readonly<Record<string, string>>, day: string) =>
  Object.values(collectedDays).filter((collectedOn) => collectedOn === day).length;

type DailyGiftInput = {
  collectedDays: Readonly<Record<string, string>>;
  /** 0 means no daily limit. */
  giftsPerDay: number;
  today: string;
};

/** Whether today's gifts are already claimed, so the machine rests until tomorrow. */
export const dailyGiftStatus = ({
  collectedDays,
  giftsPerDay,
  today,
}: DailyGiftInput) => {
  const claimedToday = claimsOn(collectedDays, today);
  return { claimedToday, resting: giftsPerDay > 0 && claimedToday >= giftsPerDay };
};

/** A dinner pick only lasts for the day it was made. */
export const isStaleDecision = (
  decision: string | null,
  decisionDay: string | null,
  today: string,
) => decision !== null && decisionDay !== today;
