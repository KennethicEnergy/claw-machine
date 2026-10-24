import { describe, expect, it } from "vitest";
import { joystickVector, keysToVector } from "./controls";

describe("keysToVector", () => {
  it("is still when nothing is pressed", () => {
    expect(keysToVector(new Set())).toEqual({ x: 0, z: 0 });
  });

  it("maps arrows and WASD onto the floor plane (up = away from you)", () => {
    expect(keysToVector(new Set(["ArrowUp"]))).toEqual({ x: 0, z: -1 });
    expect(keysToVector(new Set(["KeyS"]))).toEqual({ x: 0, z: 1 });
    expect(keysToVector(new Set(["KeyA"]))).toEqual({ x: -1, z: 0 });
    expect(keysToVector(new Set(["ArrowRight"]))).toEqual({ x: 1, z: 0 });
  });

  it("keeps diagonals at full speed, not faster", () => {
    const { x, z } = keysToVector(new Set(["KeyD", "KeyW"]));
    expect(Math.hypot(x, z)).toBeCloseTo(1);
    expect(x).toBeGreaterThan(0);
    expect(z).toBeLessThan(0);
  });

  it("cancels opposite keys", () => {
    expect(keysToVector(new Set(["ArrowLeft", "ArrowRight"]))).toEqual({ x: 0, z: 0 });
  });

  it("ignores unrelated keys", () => {
    expect(keysToVector(new Set(["Space", "KeyQ"]))).toEqual({ x: 0, z: 0 });
  });
});

describe("joystickVector", () => {
  it("scales the knob offset by the pad radius", () => {
    expect(joystickVector(30, -15, 60)).toEqual({ x: 0.5, z: -0.25 });
  });

  it("clamps to full speed outside the pad", () => {
    const { x, z } = joystickVector(300, 400, 50);
    expect(x).toBeCloseTo(0.6);
    expect(z).toBeCloseTo(0.8);
  });

  it("ignores tiny wobbles inside the dead zone", () => {
    expect(joystickVector(3, 2, 60)).toEqual({ x: 0, z: 0 });
  });
});
