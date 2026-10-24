import { CHUTE_BARRIER_HEIGHT, PIT_DEPTH, WALL_THICKNESS } from "@/config/machine";
import type { CabinetLayout } from "./layout";

type Vec3 = [number, number, number];

/** Axis-aligned box: center and half extents, ready for a cuboid collider. */
export type Box = { position: Vec3; halfExtents: Vec3 };

const BARRIER_HALF_THICKNESS = 0.04;

/**
 * Fixed cabinet geometry. The floor top is y = 0 with a square hole for the
 * chute in the front-left corner; won prizes fall into a pit with a sensor.
 */
export const cabinetBoxes = ({ halfWidth, halfDepth, height, chute }: CabinetLayout) => {
  const t = WALL_THICKNESS / 2;
  const c = chute.size;
  const holeRight = -halfWidth + c;
  const holeBack = halfDepth - c;
  const wallCenterY = (height - PIT_DEPTH) / 2;
  const wallHalfY = (height + PIT_DEPTH) / 2 + WALL_THICKNESS;

  const floor: Box[] = [
    { position: [0, -t, -c / 2], halfExtents: [halfWidth, t, halfDepth - c / 2] },
    {
      position: [c / 2, -t, halfDepth - c / 2],
      halfExtents: [halfWidth - c / 2, t, c / 2],
    },
  ];

  const walls: Box[] = [
    {
      position: [-halfWidth - t, wallCenterY, 0],
      halfExtents: [t, wallHalfY, halfDepth + 2 * t],
    },
    {
      position: [halfWidth + t, wallCenterY, 0],
      halfExtents: [t, wallHalfY, halfDepth + 2 * t],
    },
    {
      position: [0, wallCenterY, -halfDepth - t],
      halfExtents: [halfWidth + 2 * t, wallHalfY, t],
    },
    {
      position: [0, wallCenterY, halfDepth + t],
      halfExtents: [halfWidth + 2 * t, wallHalfY, t],
    },
  ];

  const ceiling: Box = {
    position: [0, height + t, 0],
    halfExtents: [halfWidth + 2 * t, t, halfDepth + 2 * t],
  };

  const barrierHalfY = CHUTE_BARRIER_HEIGHT / 2;
  const barrier: Box[] = [
    {
      position: [chute.x, barrierHalfY, holeBack],
      halfExtents: [c / 2, barrierHalfY, BARRIER_HALF_THICKNESS],
    },
    {
      position: [holeRight, barrierHalfY, chute.z],
      halfExtents: [BARRIER_HALF_THICKNESS, barrierHalfY, c / 2],
    },
  ];

  const pit: Box[] = [
    { position: [chute.x, -PIT_DEPTH - t, chute.z], halfExtents: [c / 2, t, c / 2] },
    {
      position: [holeRight + t, -PIT_DEPTH / 2, chute.z],
      halfExtents: [t, PIT_DEPTH / 2, c / 2],
    },
    {
      position: [chute.x, -PIT_DEPTH / 2, holeBack - t],
      halfExtents: [c / 2, PIT_DEPTH / 2, t],
    },
  ];

  const sensor: Box = {
    position: [chute.x, -PIT_DEPTH + 0.6, chute.z],
    halfExtents: [c / 2 - 0.08, 0.5, c / 2 - 0.08],
  };

  return { floor, walls, ceiling, barrier, pit, sensor };
};
