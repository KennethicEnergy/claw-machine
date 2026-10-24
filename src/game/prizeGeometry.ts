import type { PrizeShape } from "./types";

export type PrizeCollider =
  | { kind: "ball"; radius: number }
  | { kind: "cuboid"; halfExtents: [number, number, number] }
  | { kind: "capsule"; halfHeight: number; radius: number }
  | { kind: "cylinder"; halfHeight: number; radius: number };

/** Physics shape for a prize, shared by the collider and the mesh so they always agree. */
export const prizeCollider = (shape: PrizeShape, size: number): PrizeCollider => {
  switch (shape) {
    case "sphere":
    case "capsule-ball":
      return { kind: "ball", radius: size / 2 };
    case "plush":
      return { kind: "ball", radius: size * 0.43 };
    case "box":
      return { kind: "cuboid", halfExtents: [size * 0.46, size * 0.36, size * 0.4] };
    case "gift":
      return { kind: "cuboid", halfExtents: [size * 0.4, size * 0.4, size * 0.4] };
    case "capsule":
      return { kind: "capsule", halfHeight: size * 0.22, radius: size * 0.26 };
    case "cylinder":
      return { kind: "cylinder", halfHeight: size * 0.36, radius: size * 0.36 };
  }
};

/** Rough bounding radius used when looking for a prize under the claw. */
export const prizeRadius = (size: number) => size / 2;
