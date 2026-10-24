"use client";

import { useRef } from "react";
import type { ClawInput } from "@/game/types";
import { keysToVector } from "@/lib/controls";

const ARROWS = [
  { code: "ArrowUp", label: "Move back", symbol: "▲", area: "col-start-2 row-start-1" },
  { code: "ArrowLeft", label: "Move left", symbol: "◀", area: "col-start-1 row-start-2" },
  {
    code: "ArrowRight",
    label: "Move right",
    symbol: "▶",
    area: "col-start-3 row-start-2",
  },
  {
    code: "ArrowDown",
    label: "Move forward",
    symbol: "▼",
    area: "col-start-2 row-start-3",
  },
] as const;

type ArrowPadProps = {
  input: ClawInput;
  className?: string;
};

/** Hold-to-move arrow buttons, sharing the keyboard's direction math. */
export const ArrowPad = ({ input, className = "" }: ArrowPadProps) => {
  const held = useRef(new Set<string>());
  const press = (code: string, down: boolean) => {
    if (down) held.current.add(code);
    else held.current.delete(code);
    Object.assign(input, keysToVector(held.current));
  };

  return (
    <div className={`grid-cols-3 grid-rows-3 gap-1 ${className}`}>
      {ARROWS.map(({ code, label, symbol, area }) => (
        <button
          key={code}
          type="button"
          aria-label={label}
          className={`${area} grid h-11 w-11 touch-none select-none place-items-center rounded-2xl bg-olive-100 text-lg text-olive-700 shadow-[0_3px_0_var(--color-olive-300)] ring-2 ring-olive-300/70 transition active:translate-y-0.5 active:bg-olive-300/50`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            press(code, true);
          }}
          onPointerUp={() => press(code, false)}
          onPointerCancel={() => press(code, false)}
          onLostPointerCapture={() => press(code, false)}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
};
