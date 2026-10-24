import type { PrizeConfig } from "./types";

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
