import {
  MAX_PRIZE_BODIES,
  SPAWN_CELL,
  SPAWN_FIRST_LAYER_Y,
  SPAWN_LAYER_HEIGHT,
} from "@/config/machine";
import { hashString } from "@/lib/hash";
import { isOverChute } from "./layout";
import type { CabinetLayout, FloorPoint } from "./layout";
import { createRng, seedFor } from "./rng";
import type { PrizeConfig } from "./types";

export type Vec3 = [number, number, number];

export type SpawnInstance = {
  /** Changes whenever the body must be rebuilt (prize body edited or respawn). */
  key: string;
  prizeId: string;
  position: Vec3;
  rotation: Vec3;
};

const WALL_CLEARANCE = 0.55;
const CHUTE_CLEARANCE = 0.45;
const JITTER = 0.3;
const CEILING_CLEARANCE = 0.5;

/**
 * Floor cells, one prize per cell per layer, kept clear of the chute. Sorted
 * from the middle outward so a nearly empty machine keeps its prizes central.
 */
export const spawnCells = ({
  halfWidth,
  halfDepth,
  chute,
}: CabinetLayout): FloorPoint[] => {
  const width = 2 * (halfWidth - WALL_CLEARANCE);
  const depth = 2 * (halfDepth - WALL_CLEARANCE);
  const cols = Math.max(1, Math.floor(width / SPAWN_CELL));
  const rows = Math.max(1, Math.floor(depth / SPAWN_CELL));
  const cells = Array.from({ length: cols * rows }, (_, index) => ({
    x: -width / 2 + ((index % cols) + 0.5) * (width / cols),
    z: -depth / 2 + (Math.floor(index / cols) + 0.5) * (depth / rows),
  }));
  return cells
    .filter((cell) => !isOverChute(cell, chute, CHUTE_CLEARANCE))
    .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
};

/** Only the fields that change how a prize looks or moves; text edits keep the body. */
export const prizeBodyKey = ({
  shape,
  size,
  color,
  secondaryColor,
  emissive,
  weight,
  slipperiness,
  label,
  spawnCount,
}: PrizeConfig) =>
  hashString(
    JSON.stringify([
      shape,
      size,
      color,
      secondaryColor,
      emissive ?? "",
      weight,
      slipperiness,
      label,
      spawnCount,
    ]),
  ).toString(36);

/** Round-robin over copies so a tight cap still shows every prize. */
const expandCopies = (prizes: readonly PrizeConfig[], maxBodies: number) => {
  const mostCopies = Math.max(0, ...prizes.map(({ spawnCount }) => spawnCount));
  return Array.from({ length: mostCopies }, (_, copy) =>
    prizes
      .filter(({ spawnCount }) => spawnCount > copy)
      .map((prize) => ({ prize, copy })),
  )
    .flat()
    .slice(0, maxBodies);
};

export type SpawnOptions = {
  prizes: readonly PrizeConfig[];
  seed: number;
  epoch: number;
  layout: CabinetLayout;
  maxBodies?: number;
};

export const buildSpawnPlan = ({
  prizes,
  seed,
  epoch,
  layout,
  maxBodies = MAX_PRIZE_BODIES,
}: SpawnOptions): SpawnInstance[] => {
  const cells = spawnCells(layout);
  const copies = expandCopies(prizes, maxBodies);
  const layers = Math.ceil(copies.length / cells.length);
  const roomAbove = layout.restY - CEILING_CLEARANCE - SPAWN_FIRST_LAYER_Y - JITTER;
  const layerStep = Math.min(SPAWN_LAYER_HEIGHT, roomAbove / Math.max(1, layers - 1));
  const epochSeed = (seed + epoch * 7919) >>> 0;

  return copies.map(({ prize, copy }, index) => {
    const rng = createRng(seedFor(epochSeed, hashString(`${prize.id}#${copy}`)));
    const cell = cells[index % cells.length];
    const layer = Math.floor(index / cells.length);
    return {
      key: `${prize.id}~${prizeBodyKey(prize)}~${epoch}~${copy}`,
      prizeId: prize.id,
      position: [
        cell.x + (rng() - 0.5) * JITTER,
        SPAWN_FIRST_LAYER_Y + layer * layerStep + rng() * JITTER,
        cell.z + (rng() - 0.5) * JITTER,
      ],
      rotation: [rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2],
    };
  });
};
