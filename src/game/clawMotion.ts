import { CLAW_GEOMETRY, CLAW_MOTION } from "@/config/machine";
import { clampToBounds } from "./layout";
import type { CabinetLayout } from "./layout";
import type { ClawInput, ClawPhase } from "./types";

/** Where the claw hub is and how closed it is (0 open, 1 shut). Mutated every frame. */
export type ClawMotion = {
  x: number;
  y: number;
  z: number;
  grip: number;
};

export type ClawSignal =
  | "MOVE"
  | "STOP"
  | "REACHED_BOTTOM"
  | "GRIP_DONE"
  | "REACHED_TOP"
  | "REACHED_CHUTE"
  | "RELEASED";

export type MotionStep = {
  layout: CabinetLayout;
  input: ClawInput;
  moveSpeed: number;
  dt: number;
  /** Hub height where the current descent should stop. */
  stopY: number;
};

const { openAngle, closedAngle, hingeRadius, hingeDrop, tip } = CLAW_GEOMETRY;

/** Lowest the fingertips go when grabbing at an empty floor. */
const FLOOR_CLEARANCE = 0.12;
/** How far below a prize's center the fingertips reach. */
const GRAB_DEPTH = 0.3;

export const createClawMotion = ({ home, restY }: CabinetLayout): ClawMotion => ({
  x: home.x,
  y: restY,
  z: home.z,
  grip: 0,
});

/** Fingertip position relative to the hub center for a given prong angle. */
export const tipOffset = (angle: number) => ({
  radial: hingeRadius + tip.x * Math.cos(angle) - tip.y * Math.sin(angle),
  drop: hingeDrop - (tip.x * Math.sin(angle) + tip.y * Math.cos(angle)),
});

/** Prong angle that rests the fingertips at `radius` from the claw's axis. */
export const angleForTipRadius = (radius: number) => {
  if (radius >= tipOffset(openAngle).radial) return openAngle;
  if (radius <= tipOffset(closedAngle).radial) return closedAngle;
  let low: number = closedAngle;
  let high: number = openAngle;
  for (let index = 0; index < 30; index += 1) {
    const middle = (low + high) / 2;
    if (tipOffset(middle).radial < radius) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
};

/** Open-to-closed sweep; with a prize in the claw the prongs stop at its surface. */
export const prongAngle = (grip: number, heldRadius: number | null) => {
  const closed = heldRadius === null ? closedAngle : angleForTipRadius(heldRadius * 0.8);
  return openAngle * (1 - grip) + closed * grip;
};

/** Hub height at which open fingertips straddle the target (or skim the floor). */
export const descentStopY = (target: { y: number; radius: number } | null) => {
  const { drop } = tipOffset(openAngle);
  const floorStop = drop + FLOOR_CLEARANCE;
  if (!target) return floorStop;
  return Math.max(floorStop, target.y - target.radius * GRAB_DEPTH + drop);
};

const approach = (from: number, to: number, maxStep: number) =>
  Math.abs(to - from) <= maxStep ? to : from + Math.sign(to - from) * maxStep;

/**
 * Advances the claw one frame for its current phase, mutating `motion` in place
 * (hot path, no allocations). Returns a signal when a phase goal is reached.
 */
export const stepClawMotion = (
  motion: ClawMotion,
  phase: ClawPhase,
  { layout, input, moveSpeed, dt, stopY }: MotionStep,
): ClawSignal | null => {
  switch (phase) {
    case "idle":
    case "moving": {
      const steering = input.x !== 0 || input.z !== 0;
      if (!steering) return phase === "moving" ? "STOP" : null;
      const { x, z } = clampToBounds(
        {
          x: motion.x + input.x * moveSpeed * dt,
          z: motion.z + input.z * moveSpeed * dt,
        },
        layout.bounds,
      );
      motion.x = x;
      motion.z = z;
      return phase === "idle" ? "MOVE" : null;
    }
    case "descending":
      motion.y = approach(motion.y, stopY, CLAW_MOTION.descendSpeed * dt);
      return motion.y === stopY ? "REACHED_BOTTOM" : null;
    case "gripping": {
      if (motion.grip >= 1) return null;
      motion.grip = Math.min(1, motion.grip + dt / CLAW_MOTION.closeSeconds);
      return motion.grip === 1 ? "GRIP_DONE" : null;
    }
    case "ascending":
      motion.y = approach(motion.y, layout.restY, CLAW_MOTION.ascendSpeed * dt);
      return motion.y === layout.restY ? "REACHED_TOP" : null;
    case "returning": {
      const dx = layout.home.x - motion.x;
      const dz = layout.home.z - motion.z;
      const distance = Math.hypot(dx, dz);
      const travel = moveSpeed * dt;
      if (distance <= travel) {
        motion.x = layout.home.x;
        motion.z = layout.home.z;
        return "REACHED_CHUTE";
      }
      motion.x += (dx / distance) * travel;
      motion.z += (dz / distance) * travel;
      return null;
    }
    case "releasing":
      motion.grip = Math.max(0, motion.grip - dt / CLAW_MOTION.openSeconds);
      return motion.grip === 0 ? "RELEASED" : null;
  }
};
