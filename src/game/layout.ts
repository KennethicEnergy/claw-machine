import { CHUTE_SIZE, CLAW_REST_DROP, CLAW_WALL_MARGIN } from "@/config/machine";
import type { CabinetSize } from "./types";

export type FloorPoint = { x: number; z: number };

export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };

export type Chute = FloorPoint & { size: number };

export type CabinetLayout = {
  halfWidth: number;
  halfDepth: number;
  height: number;
  chute: Chute;
  /** Where the claw hub may travel. */
  bounds: Bounds;
  /** Claw parks above the chute. */
  home: FloorPoint;
  railY: number;
  restY: number;
};

/** All play-area geometry derived from the cabinet size. The floor is y = 0. */
export const cabinetLayout = ({ width, depth, height }: CabinetSize): CabinetLayout => {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const chute = {
    x: -halfWidth + CHUTE_SIZE / 2,
    z: halfDepth - CHUTE_SIZE / 2,
    size: CHUTE_SIZE,
  };
  return {
    halfWidth,
    halfDepth,
    height,
    chute,
    bounds: {
      minX: -halfWidth + CLAW_WALL_MARGIN,
      maxX: halfWidth - CLAW_WALL_MARGIN,
      minZ: -halfDepth + CLAW_WALL_MARGIN,
      maxZ: halfDepth - CLAW_WALL_MARGIN,
    },
    home: { x: chute.x, z: chute.z },
    railY: height,
    restY: height - CLAW_REST_DROP,
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clampToBounds = (
  { x, z }: FloorPoint,
  { minX, maxX, minZ, maxZ }: Bounds,
) => ({
  x: clamp(x, minX, maxX),
  z: clamp(z, minZ, maxZ),
});

export const isOverChute = ({ x, z }: FloorPoint, chute: Chute, padding = 0) => {
  const reach = chute.size / 2 + padding;
  return Math.abs(x - chute.x) <= reach && Math.abs(z - chute.z) <= reach;
};
