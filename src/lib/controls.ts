import type { ClawInput } from "@/game/types";

const KEY_AXES: Record<string, Partial<ClawInput>> = {
  ArrowUp: { z: -1 },
  KeyW: { z: -1 },
  ArrowDown: { z: 1 },
  KeyS: { z: 1 },
  ArrowLeft: { x: -1 },
  KeyA: { x: -1 },
  ArrowRight: { x: 1 },
  KeyD: { x: 1 },
};

export const MOVE_KEYS = new Set(Object.keys(KEY_AXES));

/** Limits a vector to length 1 so diagonals are not faster. */
const normalize = ({ x, z }: ClawInput): ClawInput => {
  const length = Math.hypot(x, z);
  return length > 1 ? { x: x / length, z: z / length } : { x, z };
};

/** Held keys (KeyboardEvent.code) to a steering vector. Up moves away from the viewer. */
export const keysToVector = (pressed: ReadonlySet<string>): ClawInput =>
  normalize(
    [...pressed].reduce<ClawInput>(
      (sum, code) => {
        const { x = 0, z = 0 } = KEY_AXES[code] ?? {};
        return { x: sum.x + x, z: sum.z + z };
      },
      { x: 0, z: 0 },
    ),
  );

const DEAD_ZONE = 0.12;

/** Knob offset in pixels to a steering vector, with a small dead zone. */
export const joystickVector = (dx: number, dy: number, radius: number): ClawInput => {
  const vector = normalize({ x: dx / radius, z: dy / radius });
  return Math.hypot(vector.x, vector.z) < DEAD_ZONE ? { x: 0, z: 0 } : vector;
};
