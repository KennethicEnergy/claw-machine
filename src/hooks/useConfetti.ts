import { useEffect } from "react";
import type { RefObject } from "react";
import { createRng } from "@/game/rng";
import { createConfetti, isConfettiDone, stepConfetti } from "@/lib/confetti";

const GRAVITY = 220;
const COUNT = 140;

/** Drops a burst of paper confetti onto a full-screen canvas, then stops. */
export const useConfetti = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  colors: readonly string[],
  enabled: boolean,
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!enabled || !canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    let pieces = createConfetti({
      count: COUNT,
      width,
      colors,
      rng: createRng(Date.now()),
    });
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      pieces = stepConfetti(pieces, dt, GRAVITY);
      context.clearRect(0, 0, width, height);
      for (const { x, y, rotation, size, color } of pieces) {
        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.fillStyle = color;
        context.fillRect(-size / 2, -size / 4, size, size / 2);
        context.restore();
      }
      if (!isConfettiDone(pieces, height)) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [canvasRef, colors, enabled]);
};
