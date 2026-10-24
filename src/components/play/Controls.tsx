"use client";

import { CONTROL_COPY, DAILY_COPY, MODE_COPY } from "@/config/copy";
import { canDrop } from "@/game/clawMachine";
import { collectProgress } from "@/game/progress";
import type { ClawInput } from "@/game/types";
import { isPlayBlocked, useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { ArrowPad } from "./ArrowPad";
import { Joystick } from "./Joystick";
import { NextGiftCountdown } from "./NextGiftCountdown";

type ControlsProps = {
  input: ClawInput;
};

/** Stick (touch) or arrows (mouse) on the left, a big Drop button on the right. */
export const Controls = ({ input }: ControlsProps) => {
  const mode = useGameStore((state) => state.mode);
  const free = useGameStore((state) => canDrop(state.claw));
  const blocked = useGameStore(isPlayBlocked);
  const resting = useGameStore((state) => state.resting);
  const decided = useGameStore(
    (state) => state.mode === "decide" && state.decision !== null,
  );
  const collected = useGameStore((state) => state.collected);
  const gifts = useMachineStore((state) => state.config.modes.collect.prizes);
  const drop = useGameStore((state) => state.drop);
  const allCollected = mode === "collect" && collectProgress(collected, gifts).done;
  const ready = free && !blocked && !allCollected;

  const label = decided
    ? CONTROL_COPY.decided
    : allCollected
      ? CONTROL_COPY.allCollected
      : resting
        ? DAILY_COPY.restingButton
        : ready
          ? CONTROL_COPY.drop
          : CONTROL_COPY.busy;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      <Joystick input={input} className="grid pointer-fine:hidden" />
      <ArrowPad input={input} className="hidden pointer-fine:grid" />
      {resting ? (
        <p className="text-center text-sm font-bold text-olive-900">
          {DAILY_COPY.restingHint}
          <span className="mt-1 block text-xs font-semibold">
            {DAILY_COPY.nextGiftIn} <NextGiftCountdown />
          </span>
        </p>
      ) : (
        <p className="text-center text-sm font-bold text-olive-900">
          {MODE_COPY[mode].hint}
          <span className="mt-1 hidden text-xs font-semibold pointer-fine:block">
            {CONTROL_COPY.keyboardHint}
          </span>
        </p>
      )}
      <button
        type="button"
        onClick={drop}
        disabled={!ready}
        className="grid h-28 w-28 place-items-center rounded-full bg-gold px-2 text-center text-xl font-black leading-tight text-olive-900 shadow-[0_6px_0_var(--color-olive-700)] ring-4 ring-cream transition hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_var(--color-olive-700)] disabled:bg-olive-100 disabled:text-base disabled:text-olive-900 disabled:shadow-[0_6px_0_var(--color-olive-300)]"
      >
        {label}
      </button>
    </div>
  );
};
