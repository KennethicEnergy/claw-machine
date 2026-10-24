import { describe, expect, it } from "vitest";
import { createRng, randomRange, rollFor } from "./rng";

const take = (rng: () => number, count: number) =>
  Array.from({ length: count }, () => rng());

describe("createRng (mulberry32)", () => {
  it("matches the reference mulberry32 sequence for seed 42", () => {
    expect(take(createRng(42), 3)).toEqual([
      0.6011037519201636, 0.44829055899754167, 0.8524657934904099,
    ]);
  });

  it("repeats the same sequence for the same seed", () => {
    expect(take(createRng(7), 5)).toEqual(take(createRng(7), 5));
  });

  it("produces a different sequence for a different seed", () => {
    expect(take(createRng(7), 5)).not.toEqual(take(createRng(8), 5));
  });

  it("stays within [0, 1) and averages near one half", () => {
    const values = take(createRng(123), 10_000);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
  });
});

describe("randomRange", () => {
  it("maps the rng output onto [min, max)", () => {
    const rng = () => 0.25;
    expect(randomRange(rng, 2, 6)).toBe(3);
  });
});

describe("rollFor", () => {
  it("is stable for the same seed and index", () => {
    expect(rollFor(99, 3)).toBe(rollFor(99, 3));
  });

  it("varies across indexes for one seed", () => {
    const rolls = new Set([0, 1, 2, 3, 4, 5].map((index) => rollFor(99, index)));
    expect(rolls.size).toBe(6);
  });
});
