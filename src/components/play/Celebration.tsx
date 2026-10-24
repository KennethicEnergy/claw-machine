"use client";

import { useMemo, useRef } from "react";
import { useConfetti } from "@/hooks/useConfetti";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button } from "../ui/Button";

/** Confetti and the final message once every gift is collected. */
export const Celebration = () => {
  const celebrating = useGameStore((state) => state.celebrating);
  const setCelebrating = useGameStore((state) => state.setCelebrating);
  const finalMessage = useMachineStore(
    (state) => state.config.modes.collect.finalMessage,
  );
  const theme = useMachineStore((state) => state.config.theme);
  const reducedMotion = usePrefersReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const colors = useMemo(
    () => [theme.gold, theme.olive300, theme.olive500, theme.cream, theme.terracotta],
    [theme],
  );
  useConfetti(canvas, colors, celebrating && !reducedMotion);

  if (!celebrating) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-40 grid place-items-center bg-olive-900/45 p-4 backdrop-blur-sm"
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none fixed inset-0 h-full w-full"
      />
      <article className="motion-safe:animate-pop relative w-full max-w-sm rounded-[2rem] bg-cream p-7 text-center shadow-2xl ring-4 ring-gold">
        <p aria-hidden className="text-4xl">
          <span className="inline-block motion-safe:animate-twinkle">✨</span>
          <span className="mx-2 inline-block">💛</span>
          <span className="inline-block motion-safe:animate-twinkle [animation-delay:600ms]">
            ✨
          </span>
        </p>
        <h2 id="celebration-title" className="mt-3 text-3xl font-black text-olive-900">
          Every gift is yours!
        </h2>
        {finalMessage && (
          <p className="mt-3 whitespace-pre-line text-lg font-semibold text-olive-700">
            {finalMessage}
          </p>
        )}
        <Button
          variant="gold"
          className="mt-6"
          onClick={() => setCelebrating(false)}
          autoFocus
        >
          Aww, thank you
        </Button>
      </article>
    </div>
  );
};
