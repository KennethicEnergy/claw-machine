import { describe, expect, it } from "vitest";
import { PRIZE_SHAPES } from "./types";
import { prizeCollider, prizeRadius } from "./prizeGeometry";

const halfHeight = (collider: ReturnType<typeof prizeCollider>) => {
  switch (collider.kind) {
    case "ball":
      return collider.radius;
    case "cuboid":
      return collider.halfExtents[1];
    case "capsule":
      return collider.halfHeight + collider.radius;
    case "cylinder":
      return collider.halfHeight;
  }
};

describe("prizeCollider", () => {
  it("uses a ball for round prizes", () => {
    expect(prizeCollider("sphere", 0.8)).toEqual({ kind: "ball", radius: 0.4 });
    expect(prizeCollider("capsule-ball", 0.8)).toEqual({ kind: "ball", radius: 0.4 });
  });

  it("uses a box for boxes and gifts", () => {
    expect(prizeCollider("box", 1).kind).toBe("cuboid");
    expect(prizeCollider("gift", 1).kind).toBe("cuboid");
  });

  it.each(PRIZE_SHAPES)("keeps a %s within its nominal size", (shape) => {
    expect(halfHeight(prizeCollider(shape, 1))).toBeLessThanOrEqual(0.5);
    expect(halfHeight(prizeCollider(shape, 1))).toBeGreaterThan(0.3);
  });

  it("scales with size", () => {
    expect(halfHeight(prizeCollider("capsule", 1.2))).toBeCloseTo(
      2 * halfHeight(prizeCollider("capsule", 0.6)),
    );
  });
});

describe("prizeRadius", () => {
  it("is half the nominal size", () => {
    expect(prizeRadius(0.9)).toBeCloseTo(0.45);
  });
});
