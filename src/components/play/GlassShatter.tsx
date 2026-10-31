"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { shatterPieces } from "@/lib/shatter";
import type { Point } from "@/lib/shatter";
import { useGameStore } from "@/stores/useGameStore";

/** How long the glass takes to crack and fall before the celebration. */
const SHATTER_MS = 1400;

const toPath = (points: Point[], closed = false) =>
  `M${points.map(({ x, y }) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}${closed ? "Z" : ""}`;

/** The easter egg: the front glass cracks from where she tapped and falls away. */
export const GlassShatter = ({ impact }: { impact: Point }) => {
  const setCelebrating = useGameStore((state) => state.setCelebrating);
  const reducedMotion = usePrefersReducedMotion();
  const [falling, setFalling] = useState(true);
  const { cracks, shards } = useMemo(
    () => shatterPieces(Math.round(impact.x * 31 + impact.y)),
    [impact],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setFalling(false);
        setCelebrating(true);
      },
      reducedMotion ? 0 : SHATTER_MS,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, setCelebrating]);

  if (!falling || reducedMotion) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      <rect width="100%" height="100%" className="animate-glass-flash fill-white" />
      <g transform={`translate(${impact.x} ${impact.y})`}>
        {shards.map(({ points, fall, spin, delay }, index) => (
          <path
            key={index}
            d={toPath(points, true)}
            className="animate-shard fill-white/25 stroke-white/70"
            strokeWidth={1}
            style={
              {
                "--fall-x": `${fall.x}px`,
                "--fall-y": `${fall.y}px`,
                "--spin": `${spin}deg`,
                animationDelay: `${delay}ms`,
              } as CSSProperties
            }
          />
        ))}
        {cracks.map((points, index) => (
          <path
            key={index}
            d={toPath(points)}
            pathLength={1}
            className="animate-crack fill-none stroke-white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
};
