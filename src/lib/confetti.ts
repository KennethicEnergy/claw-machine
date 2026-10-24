import type { Rng } from "@/game/rng";

export type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  color: string;
};

type ConfettiOptions = {
  count: number;
  width: number;
  colors: readonly string[];
  rng: Rng;
};

/** Pieces start just above the screen and flutter down. */
export const createConfetti = ({ count, width, colors, rng }: ConfettiOptions) =>
  Array.from({ length: count }, (): ConfettiPiece => ({
    x: rng() * width,
    y: -10 - rng() * 240,
    vx: (rng() - 0.5) * 120,
    vy: 40 + rng() * 140,
    rotation: rng() * Math.PI * 2,
    spin: (rng() - 0.5) * 10,
    size: 5 + rng() * 7,
    color: colors[Math.floor(rng() * colors.length)],
  }));

export const stepConfetti = (
  pieces: readonly ConfettiPiece[],
  dt: number,
  gravity: number,
) =>
  pieces.map((piece) => {
    const vy = piece.vy + gravity * dt;
    return {
      ...piece,
      vy,
      x: piece.x + piece.vx * dt,
      y: piece.y + vy * dt,
      rotation: piece.rotation + piece.spin * dt,
    };
  });

export const isConfettiDone = (pieces: readonly ConfettiPiece[], height: number) =>
  pieces.every(({ y }) => y > height);
