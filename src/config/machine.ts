/** Physics budget: keeps 60fps on a mid-range phone. */
export const MAX_PRIZE_BODIES = 40;

/** Width of the square prize chute in the front-left corner. */
export const CHUTE_SIZE = 1.4;

/** Height of the clear barrier that keeps the pile out of the chute. */
export const CHUTE_BARRIER_HEIGHT = 0.6;

/** How far the claw hub stays from the glass walls. */
export const CLAW_WALL_MARGIN = 0.55;

/** How far below the top rail the claw hangs at rest. */
export const CLAW_REST_DROP = 1.3;

/**
 * One prong in its own frame: hinged on the hub, pointing down (-y), with +x
 * facing outward. Rotating by a positive angle about the tangent axis opens it.
 */
export const CLAW_GEOMETRY = {
  hubRadius: 0.22,
  hingeRadius: 0.15,
  hingeDrop: 0.08,
  knee: { x: 0.2, y: -0.5 },
  tip: { x: 0.06, y: -0.86 },
  prongThickness: 0.045,
  openAngle: 0.5,
  closedAngle: -0.2,
} as const;

/** Horizontal reach used to find a prize under the claw. */
export const CLAW_GRAB_RADIUS = 0.45;

export const CLAW_MOTION = {
  descendSpeed: 2.6,
  ascendSpeed: 2,
  closeSeconds: 0.5,
  openSeconds: 0.45,
  /** How far up a slipping prize rides before it wiggles free. */
  slipLiftMin: 0.5,
  slipLiftMax: 1.8,
} as const;

/** Spacing for the jittered spawn grid and the height of each spawn layer. */
export const SPAWN_CELL = 1.0;
export const SPAWN_LAYER_HEIGHT = 1.2;
export const SPAWN_FIRST_LAYER_Y = 0.9;

/** Visual cabinet parts around the play area (world units). */
export const CABINET_BASE_HEIGHT = 2.6;
export const MARQUEE_HEIGHT = 1.3;
export const CABINET_TRIM = 0.3;
/** Depth of the pit under the chute where won prizes land. */
export const PIT_DEPTH = 2;
export const WALL_THICKNESS = 0.2;
