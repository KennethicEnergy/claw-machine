import { createRng, randomRange } from "@/game/rng";

export type Point = { x: number; y: number };

export type Shard = {
  points: Point[];
  /** Where it falls to, relative to where it starts, in px. */
  fall: Point;
  /** Degrees it turns while falling. */
  spin: number;
  /** ms before it starts to fall. */
  delay: number;
};

const RAYS = 9;
/** Ring radii, in px from the impact, where the cracks are joined up. */
const RINGS = [45, 120, 230];

const along = (angle: number, radius: number): Point => ({
  x: Math.cos(angle) * radius,
  y: Math.sin(angle) * radius,
});

/**
 * Cracks and falling shards around an impact at (0, 0): rays out from the
 * impact, cut into pieces by rings. Seeded, so the same tap breaks the same way.
 */
export const shatterPieces = (seed: number) => {
  const rng = createRng(seed);
  const angles = Array.from(
    { length: RAYS },
    (_, index) => ((index + randomRange(rng, -0.3, 0.3)) / RAYS) * Math.PI * 2,
  );
  // Each ray's corner points, wobbled a little so the cracks look hand-broken.
  const rays = angles.map((angle) =>
    RINGS.map((radius) =>
      along(angle + randomRange(rng, -0.08, 0.08), radius * randomRange(rng, 0.85, 1.15)),
    ),
  );

  const cracks = rays.map((corners) => [{ x: 0, y: 0 }, ...corners]);

  const shards: Shard[] = rays.flatMap((corners, index) => {
    const next = rays[(index + 1) % RAYS];
    const middle = angles[index] + Math.PI / RAYS;
    return RINGS.map((_, ring) => {
      const points =
        ring === 0
          ? [{ x: 0, y: 0 }, corners[0], next[0]]
          : [corners[ring - 1], corners[ring], next[ring], next[ring - 1]];
      return {
        points,
        fall: {
          x: Math.cos(middle) * randomRange(rng, 20, 70),
          y: randomRange(rng, 260, 420),
        },
        spin: randomRange(rng, -60, 60),
        delay: Math.round(randomRange(rng, 220, 480)),
      };
    });
  });

  return { cracks, shards };
};
