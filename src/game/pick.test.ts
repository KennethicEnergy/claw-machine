import { describe, expect, it } from "vitest";
import { findGrabTarget } from "./pick";

const body = (key: string, x: number, y: number, z: number, radius = 0.4) => ({
  key,
  x,
  y,
  z,
  radius,
});

describe("findGrabTarget", () => {
  it("returns null when nothing is under the claw", () => {
    expect(findGrabTarget({ x: 0, z: 0 }, [body("far", 3, 0.4, 0)], 0.5)).toBeNull();
  });

  it("picks the prize sitting on top of the pile", () => {
    const pile = [
      body("bottom", 0, 0.4, 0),
      body("top", 0.2, 1.1, 0.1),
      body("side", 0.3, 0.4, 0),
    ];
    expect(findGrabTarget({ x: 0, z: 0 }, pile, 0.5)?.key).toBe("top");
  });

  it("counts a prize whose edge reaches into the claw", () => {
    // 0.5 reach + half of a 0.6 radius = 0.8 horizontal tolerance
    expect(
      findGrabTarget({ x: 0, z: 0 }, [body("edge", 0.75, 0.6, 0, 0.6)], 0.5)?.key,
    ).toBe("edge");
    expect(
      findGrabTarget({ x: 0, z: 0 }, [body("out", 0.85, 0.6, 0, 0.6)], 0.5),
    ).toBeNull();
  });

  it("measures distance on the floor plane only", () => {
    expect(findGrabTarget({ x: 0, z: 0 }, [body("high", 0.1, 5, 0.1)], 0.5)?.key).toBe(
      "high",
    );
  });
});
