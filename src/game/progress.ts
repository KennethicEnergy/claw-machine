import type { GameState, PrizeConfig } from "./types";

/** "3 of 8 gifts collected", counting only gifts that still exist in the config. */
export const collectProgress = (
  collected: readonly string[],
  prizes: readonly PrizeConfig[],
) => {
  const ids = new Set(prizes.map(({ id }) => id));
  const count = new Set(collected.filter((id) => ids.has(id))).size;
  const total = ids.size;
  return { count, total, done: total > 0 && count === total };
};

type GiftProgress = Pick<GameState, "collected" | "collectedDays">;

/**
 * Every gift won in either copy of the progress. A second copy of the app
 * (another tab, or the home-screen icon) saves its own older list, and that
 * must never erase a gift she already won.
 */
export const mergeProgress = (
  current: GiftProgress,
  saved: Partial<GiftProgress> = {},
): GiftProgress => ({
  collected: [...new Set([...current.collected, ...(saved.collected ?? [])])],
  collectedDays: { ...saved.collectedDays, ...current.collectedDays },
});
