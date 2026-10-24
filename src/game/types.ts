export const PRIZE_SHAPES = [
  "sphere",
  "box",
  "capsule",
  "cylinder",
  "plush",
  "gift",
  "capsule-ball",
] as const;

export type PrizeShape = (typeof PRIZE_SHAPES)[number];

export const MODE_IDS = ["decide", "collect"] as const;

export type ModeId = (typeof MODE_IDS)[number];

export type PrizeConfig = {
  id: string;
  name: string;
  shape: PrizeShape;
  /** Overall prize size in world units (0.3–1.2). */
  size: number;
  color: string;
  secondaryColor: string;
  emissive?: string;
  weight: number;
  /** 0 = grippy, 1 = very slippery. */
  slipperiness: number;
  /** Short text printed on the prize tag. */
  label: string;
  revealTitle: string;
  revealMessage: string;
  /** Remote URL or an uploaded image stored as a data URL. */
  imageUrl?: string;
  link?: string;
  /** Collect mode only, e.g. "Valid for one weekend trip". */
  redeemNote?: string;
  spawnCount: number;
};

export type ModeConfig = {
  prizes: PrizeConfig[];
};

export type CollectModeConfig = ModeConfig & {
  /** Shown once every gift has been collected. */
  finalMessage: string;
};

export type ThemePalette = {
  olive900: string;
  olive700: string;
  olive500: string;
  olive400: string;
  olive300: string;
  olive100: string;
  cream: string;
  gold: string;
  terracotta: string;
};

export type CabinetSize = {
  width: number;
  depth: number;
  height: number;
};

export type MachineConfig = {
  /** Bumped on export so a newer shipped config replaces older saved ones. */
  revision: number;
  title: string;
  subtitle: string;
  editPin: string;
  cabinet: CabinetSize;
  /** 0–1, how firmly the claw closes. */
  clawStrength: number;
  /** Horizontal claw speed in units per second. */
  clawSpeed: number;
  /** Failed grabs after which the next grab always holds. */
  pityThreshold: number;
  /** Gifts she can collect per day (0 = no limit). */
  giftsPerDay: number;
  gravity: number;
  seed: number;
  theme: ThemePalette;
  modes: {
    decide: ModeConfig;
    collect: CollectModeConfig;
  };
};

export const CLAW_PHASES = [
  "idle",
  "moving",
  "descending",
  "gripping",
  "ascending",
  "returning",
  "releasing",
] as const;

export type ClawPhase = (typeof CLAW_PHASES)[number];

export type ClawState = {
  phase: ClawPhase;
  /** Spawned instance currently in the claw, if any. */
  grabbedKey: string | null;
  /** Whether the current grab is destined to hold all the way to the chute. */
  holds: boolean;
};

export type ClawEvent =
  | { type: "MOVE" }
  | { type: "STOP" }
  | { type: "DROP" }
  | { type: "REACHED_BOTTOM" }
  | { type: "GRIP_CLOSED"; grabbedKey: string | null; holds: boolean }
  | { type: "SLIPPED" }
  | { type: "REACHED_TOP" }
  | { type: "REACHED_CHUTE" }
  | { type: "RELEASED" }
  | { type: "RESET" };

export type Reveal = {
  mode: ModeId;
  prizeId: string;
  /** True right after a win; false when reopened from the gift box. */
  fresh: boolean;
};

export type GameState = {
  mode: ModeId;
  claw: ClawState;
  /** Failed grabs since the last win. */
  pity: number;
  /** Total grabs so far; indexes the seeded grip rolls. */
  attempts: number;
  /** Bumped to respawn every prize. */
  spawnEpoch: number;
  /** Instances that already dropped into the chute this round. */
  removedKeys: string[];
  /** Decide mode winner. */
  decision: string | null;
  /** Day the dinner pick was made; it expires at the next local midnight. */
  decisionDay: string | null;
  /** Collect mode prize ids in the order they were won. */
  collected: string[];
  /** Day each gift was collected, by prize id. */
  collectedDays: Record<string, string>;
  /** Today's gifts are claimed, so the claw rests until tomorrow. */
  resting: boolean;
  reveal: Reveal | null;
  celebrating: boolean;
  toast: { id: number; text: string } | null;
  editMode: boolean;
  selectedPrizeId: string | null;
};

/** Mutable steering vector written by keyboard/joystick, read every frame. */
export type ClawInput = {
  x: number;
  z: number;
};
