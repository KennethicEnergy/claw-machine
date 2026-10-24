type Point2 = { x: number; y: number };

/**
 * Center, Z rotation and length that make a Y-aligned rod (cylinder or capsule)
 * span from `from` to `to` in the XY plane.
 */
export const segmentTransform = (from: Point2, to: Point2) => ({
  position: [(from.x + to.x) / 2, (from.y + to.y) / 2, 0] as [number, number, number],
  rotationZ: Math.atan2(to.x - from.x, from.y - to.y),
  length: Math.hypot(to.x - from.x, to.y - from.y),
});
