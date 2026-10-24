import { describe, expect, it } from "vitest";
import { CLAW_GEOMETRY, CLAW_MOTION } from "@/config/machine";
import { cabinetLayout } from "./layout";
import {
  angleForTipRadius,
  createClawMotion,
  descentStopY,
  prongAngle,
  stepClawMotion,
  tipOffset,
} from "./clawMotion";
import type { ClawPhase } from "./types";

const layout = cabinetLayout({ width: 6, depth: 4.5, height: 6.5 });
const still = { x: 0, z: 0 };

const step = (
  phase: ClawPhase,
  motion = createClawMotion(layout),
  { input = still, dt = 0.1, stopY = 1 } = {},
) => ({
  motion,
  signal: stepClawMotion(motion, phase, { layout, input, moveSpeed: 2, dt, stopY }),
});

describe("createClawMotion", () => {
  it("starts open, parked above the chute", () => {
    expect(createClawMotion(layout)).toEqual({
      x: layout.home.x,
      y: layout.restY,
      z: layout.home.z,
      grip: 0,
    });
  });
});

describe("stepClawMotion", () => {
  it("steers with the input and reports that it started moving", () => {
    const { motion, signal } = step(
      "idle",
      { x: 0, y: 5, z: 0, grip: 0 },
      { input: { x: 1, z: -0.5 } },
    );
    expect(signal).toBe("MOVE");
    expect(motion.x).toBeCloseTo(0.2);
    expect(motion.z).toBeCloseTo(-0.1);
  });

  it("reports a stop when the input is released", () => {
    const { motion, signal } = step("moving", { x: 0.5, y: 5, z: 0, grip: 0 });
    expect(signal).toBe("STOP");
    expect(motion.x).toBe(0.5);
  });

  it("keeps the claw inside its bounds", () => {
    const { motion } = step(
      "moving",
      { x: 0, y: 5, z: 0, grip: 0 },
      { input: { x: 1, z: 0 }, dt: 60 },
    );
    expect(motion.x).toBe(layout.bounds.maxX);
  });

  it("descends and stops exactly at the stop height", () => {
    const start = { x: 0, y: 2, z: 0, grip: 0 };
    expect(step("descending", start, { stopY: 1 }).signal).toBeNull();
    const { motion, signal } = step("descending", start, { stopY: 1, dt: 1 });
    expect(signal).toBe("REACHED_BOTTOM");
    expect(motion.y).toBe(1);
  });

  it("closes over the close duration and signals once when shut", () => {
    const motion = { x: 0, y: 1, z: 0, grip: 0 };
    const half = CLAW_MOTION.closeSeconds / 2;
    expect(step("gripping", motion, { dt: half }).signal).toBeNull();
    expect(motion.grip).toBeCloseTo(0.5);
    expect(step("gripping", motion, { dt: half }).signal).toBe("GRIP_DONE");
    expect(step("gripping", motion, { dt: half }).signal).toBeNull();
    expect(motion.grip).toBe(1);
  });

  it("rises back to the rest height", () => {
    const { motion, signal } = step("ascending", {
      x: 0,
      y: layout.restY - 0.1,
      z: 0,
      grip: 1,
    });
    expect(signal).toBe("REACHED_TOP");
    expect(motion.y).toBe(layout.restY);
  });

  it("glides home at claw speed and signals on arrival", () => {
    const motion = { x: 1, y: layout.restY, z: layout.home.z, grip: 1 };
    const before = motion.x - layout.home.x;
    expect(step("returning", motion).signal).toBeNull();
    expect(before - (motion.x - layout.home.x)).toBeCloseTo(0.2);
    expect(step("returning", motion, { dt: 10 }).signal).toBe("REACHED_CHUTE");
    expect(motion).toMatchObject(layout.home);
  });

  it("opens over the open duration and signals when released", () => {
    const motion = { ...layout.home, y: layout.restY, grip: 1 };
    expect(
      step("releasing", motion, { dt: CLAW_MOTION.openSeconds / 2 }).signal,
    ).toBeNull();
    expect(step("releasing", motion, { dt: CLAW_MOTION.openSeconds }).signal).toBe(
      "RELEASED",
    );
    expect(motion.grip).toBe(0);
  });
});

describe("prong geometry", () => {
  it("spreads the fingertips wide when open and nearly closes them when shut", () => {
    expect(tipOffset(CLAW_GEOMETRY.openAngle).radial).toBeGreaterThan(0.55);
    expect(tipOffset(CLAW_GEOMETRY.closedAngle).radial).toBeLessThan(0.06);
  });

  it("finds the angle that rests the fingertips on a prize", () => {
    expect(tipOffset(angleForTipRadius(0.3)).radial).toBeCloseTo(0.3, 3);
  });

  it("clamps impossible radii to the prong's range", () => {
    expect(angleForTipRadius(5)).toBe(CLAW_GEOMETRY.openAngle);
    expect(angleForTipRadius(0)).toBe(CLAW_GEOMETRY.closedAngle);
  });

  it("closes fully on air but stops at a held prize", () => {
    expect(prongAngle(0, null)).toBe(CLAW_GEOMETRY.openAngle);
    expect(prongAngle(1, null)).toBe(CLAW_GEOMETRY.closedAngle);
    expect(prongAngle(1, 0.4)).toBeGreaterThan(CLAW_GEOMETRY.closedAngle);
  });
});

describe("descentStopY", () => {
  const openDrop = tipOffset(CLAW_GEOMETRY.openAngle).drop;

  it("stops with open fingertips just above the floor when nothing is below", () => {
    const stop = descentStopY(null);
    expect(stop - openDrop).toBeGreaterThan(0);
    expect(stop - openDrop).toBeLessThan(0.2);
  });

  it("stops so the fingertips reach a little below the prize's middle", () => {
    const stop = descentStopY({ y: 2, radius: 0.4 });
    expect(stop - openDrop).toBeLessThan(2);
    expect(stop - openDrop).toBeGreaterThan(2 - 0.4);
  });

  it("never sends the fingertips through the floor", () => {
    expect(descentStopY({ y: 0.1, radius: 0.4 })).toBe(descentStopY(null));
  });
});
