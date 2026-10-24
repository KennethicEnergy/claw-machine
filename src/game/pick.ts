import type { FloorPoint } from "./layout";

export type PrizeBody = FloorPoint & {
  key: string;
  y: number;
  radius: number;
};

/**
 * The prize the claw would close on: the highest one whose center lies within
 * `reach` of the claw on the floor plane, allowing half its radius as overlap.
 */
export const findGrabTarget = <T extends PrizeBody>(
  claw: FloorPoint,
  bodies: readonly T[],
  reach: number,
): T | null =>
  bodies.reduce<T | null>((best, body) => {
    const distance = Math.hypot(body.x - claw.x, body.z - claw.z);
    if (distance > reach + body.radius / 2) return best;
    if (!best || body.y + body.radius > best.y + best.radius) return body;
    return best;
  }, null);
