import type { ModeId, PrizeConfig } from "@/game/types";
import { DEFAULT_THEME } from "./theme";

const TEMPLATES: Record<ModeId, Omit<PrizeConfig, "id">> = {
  decide: {
    name: "New place",
    shape: "sphere",
    size: 0.7,
    color: DEFAULT_THEME.olive300,
    secondaryColor: DEFAULT_THEME.cream,
    weight: 1,
    slipperiness: 0.3,
    label: "New",
    revealTitle: "A new place",
    revealMessage: "",
    spawnCount: 2,
  },
  collect: {
    name: "New gift",
    shape: "gift",
    size: 0.75,
    color: DEFAULT_THEME.cream,
    secondaryColor: DEFAULT_THEME.gold,
    weight: 1,
    slipperiness: 0.3,
    label: "Gift",
    revealTitle: "A gift for you",
    revealMessage: "",
    redeemNote: "",
    spawnCount: 2,
  },
};

export const newPrize = (mode: ModeId, id: string): PrizeConfig => ({
  ...TEMPLATES[mode],
  id,
});
