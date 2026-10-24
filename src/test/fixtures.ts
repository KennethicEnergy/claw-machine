import type { MachineConfig, PrizeConfig } from "@/game/types";

export const makePrize = (overrides: Partial<PrizeConfig> = {}): PrizeConfig => ({
  id: "ramen",
  name: "Ramen night",
  shape: "sphere",
  size: 0.7,
  color: "#A3B15A",
  secondaryColor: "#F4F1E1",
  weight: 1,
  slipperiness: 0.3,
  label: "Ramen",
  revealTitle: "Ramen night",
  revealMessage: "Big bowls, extra egg.",
  spawnCount: 2,
  ...overrides,
});

export const makeConfig = (overrides: Partial<MachineConfig> = {}): MachineConfig => ({
  revision: 1,
  title: "Pick one, love",
  subtitle: "A little machine for us",
  editPin: "1234",
  cabinet: { width: 6, depth: 4.5, height: 6.5 },
  clawStrength: 0.55,
  clawSpeed: 2.4,
  pityThreshold: 3,
  giftsPerDay: 1,
  gravity: 12,
  seed: 1402,
  theme: {
    olive900: "#2F3A17",
    olive700: "#4B5A22",
    olive500: "#6B7A2E",
    olive400: "#808F3C",
    olive300: "#A3B15A",
    olive100: "#E4E9C8",
    cream: "#F4F1E1",
    gold: "#C9A24B",
    terracotta: "#B9785F",
  },
  modes: {
    decide: { prizes: [makePrize(), makePrize({ id: "tacos", name: "Tacos" })] },
    collect: {
      prizes: [makePrize({ id: "letter", name: "A letter", shape: "gift" })],
      finalMessage: "You found them all.",
    },
  },
  ...overrides,
});
