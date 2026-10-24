"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import type { ClawInput } from "@/game/types";
import { joystickVector } from "@/lib/controls";

const RADIUS = 46;

type JoystickProps = {
  input: ClawInput;
  className?: string;
};

/** Thumb stick for phones. Pushing up moves the claw toward the back. */
export const Joystick = ({ input, className = "" }: JoystickProps) => {
  const knob = useRef<HTMLSpanElement>(null);

  const steer = (dx: number, dy: number) => {
    const vector = joystickVector(dx, dy, RADIUS);
    Object.assign(input, vector);
    if (knob.current) {
      knob.current.style.transform = `translate(${vector.x * RADIUS}px, ${vector.z * RADIUS}px)`;
    }
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    steer(event.clientX - (left + width / 2), event.clientY - (top + height / 2));
  };

  return (
    <div
      role="application"
      aria-label="Joystick: drag to move the claw"
      className={`relative h-32 w-32 touch-none select-none place-items-center rounded-full bg-olive-100 shadow-inner ring-4 ring-olive-300/70 ${className}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        handleMove(event);
      }}
      onPointerMove={handleMove}
      onPointerUp={() => steer(0, 0)}
      onPointerCancel={() => steer(0, 0)}
      onLostPointerCapture={() => steer(0, 0)}
    >
      <span
        ref={knob}
        className="pointer-events-none h-14 w-14 rounded-full bg-olive-500 shadow-[0_4px_0_var(--color-olive-700)] ring-4 ring-olive-300 transition-transform duration-75"
      />
    </div>
  );
};
