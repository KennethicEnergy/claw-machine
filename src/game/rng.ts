export type Rng = () => number;

/** Seedable mulberry32 PRNG returning floats in [0, 1). */
export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomRange = (rng: Rng, min: number, max: number) =>
  min + rng() * (max - min);

/** Mixes a seed with an index so each attempt gets its own reproducible stream. */
export const seedFor = (seed: number, index: number) =>
  (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;

/** One reproducible roll for the given seed and attempt index. */
export const rollFor = (seed: number, index: number) => createRng(seedFor(seed, index))();
