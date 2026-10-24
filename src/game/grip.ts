import { rollFor } from "./rng";

export const MIN_GRIP_CHANCE = 0.05;

const WEIGHT_PENALTY = 0.15;
const SLIP_PENALTY = 0.4;
/** At the pity threshold the claw reaches 2.5x as far, so near misses still catch something. */
const MAX_ASSIST_GROWTH = 1.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type GripFactors = {
  clawStrength: number;
  weight: number;
  slipperiness: number;
};

export type PityFactors = {
  failedAttempts: number;
  pityThreshold: number;
};

export type GripTarget = Pick<GripFactors, "weight" | "slipperiness">;

export type GripMachine = {
  clawStrength: number;
  pityThreshold: number;
  seed: number;
};

export type AttemptProgress = {
  pity: number;
  attempts: number;
};

export type AttemptResult = AttemptProgress & {
  holds: boolean;
  chance: number;
};

/** How far along the pity ramp we are, from 0 (fresh) to 1 (guaranteed). */
const pityProgress = ({ failedAttempts, pityThreshold }: PityFactors) =>
  pityThreshold <= 0 ? 1 : Math.min(1, failedAttempts / pityThreshold);

/** Chance before pity: strong claws help, heavy and slippery prizes hurt. */
export const baseGripChance = ({ clawStrength, weight, slipperiness }: GripFactors) =>
  clamp(
    clawStrength - WEIGHT_PENALTY * (weight - 1) - SLIP_PENALTY * slipperiness,
    MIN_GRIP_CHANCE,
    1,
  );

/** Each failure closes an equal slice of the gap to certainty. */
export const gripChance = ({
  failedAttempts,
  pityThreshold,
  ...factors
}: GripFactors & PityFactors) => {
  const base = baseGripChance(factors);
  return base + (1 - base) * pityProgress({ failedAttempts, pityThreshold });
};

/** Rolls one grab. An empty grab (no target) is a failure that still builds pity. */
export const resolveAttempt = (
  { pity, attempts }: AttemptProgress,
  target: GripTarget | null,
  { clawStrength, pityThreshold, seed }: GripMachine,
): AttemptResult => {
  const chance = target
    ? gripChance({ ...target, clawStrength, failedAttempts: pity, pityThreshold })
    : 0;
  const holds = rollFor(seed, attempts) < chance;
  return { holds, chance, pity: holds ? 0 : pity + 1, attempts: attempts + 1 };
};

/** The claw reaches a little further for prizes after every miss. */
export const assistRadius = (
  baseRadius: number,
  failedAttempts: number,
  pityThreshold: number,
) =>
  baseRadius * (1 + MAX_ASSIST_GROWTH * pityProgress({ failedAttempts, pityThreshold }));
