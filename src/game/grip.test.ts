import { describe, expect, it } from "vitest";
import {
  assistRadius,
  baseGripChance,
  gripChance,
  MIN_GRIP_CHANCE,
  resolveAttempt,
} from "./grip";

const worstCase = { clawStrength: 0, weight: 5, slipperiness: 1 };
const average = { clawStrength: 0.6, weight: 1, slipperiness: 0.3 };

describe("baseGripChance", () => {
  it("rises with claw strength", () => {
    expect(baseGripChance({ ...average, clawStrength: 0.9 })).toBeGreaterThan(
      baseGripChance({ ...average, clawStrength: 0.4 }),
    );
  });

  it("falls as the prize gets heavier", () => {
    expect(baseGripChance({ ...average, weight: 2.5 })).toBeLessThan(
      baseGripChance({ ...average, weight: 0.5 }),
    );
  });

  it("falls as the prize gets more slippery", () => {
    expect(baseGripChance({ ...average, slipperiness: 0.9 })).toBeLessThan(
      baseGripChance({ ...average, slipperiness: 0.1 }),
    );
  });

  it("never drops below the minimum chance", () => {
    expect(baseGripChance(worstCase)).toBe(MIN_GRIP_CHANCE);
  });

  it("never exceeds certainty", () => {
    expect(baseGripChance({ clawStrength: 1, weight: 0.1, slipperiness: 0 })).toBe(1);
  });
});

describe("gripChance with pity", () => {
  it("climbs with every failed attempt", () => {
    const chances = [0, 1, 2].map((failedAttempts) =>
      gripChance({ ...worstCase, failedAttempts, pityThreshold: 3 }),
    );
    expect(chances[1]).toBeGreaterThan(chances[0]);
    expect(chances[2]).toBeGreaterThan(chances[1]);
  });

  it("closes the gap to certainty evenly across the threshold", () => {
    // base 0.25 (strength 0.6, weight 2, slip 0.5); 1 of 3 failures closes a third of 0.75
    const factors = { clawStrength: 0.6, weight: 2, slipperiness: 0.5 };
    expect(gripChance({ ...factors, failedAttempts: 1, pityThreshold: 3 })).toBeCloseTo(
      0.5,
    );
  });

  it("guarantees a hold once failures reach the threshold", () => {
    expect(gripChance({ ...worstCase, failedAttempts: 3, pityThreshold: 3 })).toBe(1);
    expect(gripChance({ ...worstCase, failedAttempts: 7, pityThreshold: 3 })).toBe(1);
  });

  it("always holds when the threshold is zero", () => {
    expect(gripChance({ ...worstCase, failedAttempts: 0, pityThreshold: 0 })).toBe(1);
  });
});

describe("resolveAttempt", () => {
  const machine = { clawStrength: 0, pityThreshold: 3, seed: 2024 };
  const target = { weight: 5, slipperiness: 1 };

  it("wins within threshold + 1 grabs for every seed, even at worst-case odds", () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      let progress = { pity: 0, attempts: 0 };
      let grabs = 0;
      let holds = false;
      while (!holds) {
        const result = resolveAttempt(progress, target, { ...machine, seed });
        progress = { pity: result.pity, attempts: result.attempts };
        holds = result.holds;
        grabs += 1;
        expect(grabs).toBeLessThanOrEqual(machine.pityThreshold + 1);
      }
    }
  });

  it("holds on the grab right after N failures", () => {
    const result = resolveAttempt({ pity: 3, attempts: 41 }, target, machine);
    expect(result).toMatchObject({ holds: true, chance: 1, pity: 0, attempts: 42 });
  });

  it("counts a slip as a failure and raises pity", () => {
    // seed 2024, attempt 0 rolls above the 5% worst-case chance
    const result = resolveAttempt({ pity: 0, attempts: 0 }, target, machine);
    expect(result).toMatchObject({ holds: false, pity: 1, attempts: 1 });
  });

  it("counts an empty grab as a failure", () => {
    const result = resolveAttempt({ pity: 1, attempts: 5 }, null, machine);
    expect(result).toEqual({ holds: false, chance: 0, pity: 2, attempts: 6 });
  });

  it("returns the same outcome for the same seed and attempt", () => {
    const progress = { pity: 1, attempts: 9 };
    const midTarget = { weight: 1, slipperiness: 0.3 };
    const midMachine = { ...machine, clawStrength: 0.5 };
    expect(resolveAttempt(progress, midTarget, midMachine)).toEqual(
      resolveAttempt(progress, midTarget, midMachine),
    );
  });
});

describe("assistRadius", () => {
  it("starts at the base radius", () => {
    expect(assistRadius(0.5, 0, 3)).toBe(0.5);
  });

  it("reaches more than twice as far once the misses hit the threshold", () => {
    expect(assistRadius(0.5, 3, 3)).toBeGreaterThan(1);
  });

  it("widens as failures pile up, capped at the threshold", () => {
    expect(assistRadius(0.5, 2, 3)).toBeGreaterThan(assistRadius(0.5, 1, 3));
    expect(assistRadius(0.5, 9, 3)).toBe(assistRadius(0.5, 3, 3));
  });
});
