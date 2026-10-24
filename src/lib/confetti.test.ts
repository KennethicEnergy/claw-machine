import { describe, expect, it } from "vitest";
import { createRng } from "@/game/rng";
import { createConfetti, isConfettiDone, stepConfetti } from "./confetti";

const colors = ["#C9A24B", "#A3B15A"];

describe("createConfetti", () => {
  it("creates the requested number of pieces above the screen using the palette", () => {
    const pieces = createConfetti({ count: 50, width: 400, colors, rng: createRng(1) });
    expect(pieces).toHaveLength(50);
    expect(pieces.every(({ y }) => y < 0)).toBe(true);
    expect(pieces.every(({ x }) => x >= 0 && x <= 400)).toBe(true);
    expect(pieces.every(({ color }) => colors.includes(color))).toBe(true);
  });
});

describe("stepConfetti", () => {
  it("moves each piece by its velocity and pulls it down", () => {
    const [piece] = stepConfetti(
      [{ x: 10, y: 20, vx: 30, vy: 40, rotation: 0, spin: 2, size: 6, color: "#fff" }],
      0.5,
      100,
    );
    expect(piece).toMatchObject({ x: 25, y: 40 + 25, vy: 90, rotation: 1 });
  });
});

describe("isConfettiDone", () => {
  it("is done once every piece has fallen past the bottom", () => {
    const piece = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      spin: 0,
      size: 6,
      color: "#fff",
    };
    expect(isConfettiDone([{ ...piece, y: 500 }], 400)).toBe(true);
    expect(
      isConfettiDone(
        [
          { ...piece, y: 500 },
          { ...piece, y: 100 },
        ],
        400,
      ),
    ).toBe(false);
  });
});
