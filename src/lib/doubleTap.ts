export type Tap = { x: number; y: number; time: number };

export const DOUBLE_TAP_MS = 350;
export const DOUBLE_TAP_PX = 40;

/** A second tap soon after the first, in about the same spot. */
export const isDoubleTap = (previous: Tap | null, next: Tap) =>
  previous !== null &&
  next.time - previous.time <= DOUBLE_TAP_MS &&
  Math.hypot(next.x - previous.x, next.y - previous.y) <= DOUBLE_TAP_PX;
