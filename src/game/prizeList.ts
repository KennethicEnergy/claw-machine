import type { PrizeConfig } from "./types";

type PrizeList = PrizeConfig[];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** A readable id that is unique among `takenIds`, e.g. "ramen-night-2". */
export const createPrizeId = (name: string, takenIds: readonly string[]) => {
  const base = slugify(name) || "prize";
  const taken = new Set(takenIds);
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
};

export const addPrize = (list: PrizeList, prize: PrizeConfig) => [...list, prize];

export const duplicatePrize = (list: PrizeList, id: string, newId: string) => {
  const index = list.findIndex((prize) => prize.id === id);
  if (index === -1) return list;
  const original = list[index];
  const copy = { ...original, id: newId, name: `${original.name} (copy)` };
  return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
};

export const removePrize = (list: PrizeList, id: string) =>
  list.filter((prize) => prize.id !== id);

export const movePrize = (list: PrizeList, id: string, direction: -1 | 1) => {
  const from = list.findIndex((prize) => prize.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

export const updatePrize = (list: PrizeList, id: string, patch: Partial<PrizeConfig>) =>
  list.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize));
