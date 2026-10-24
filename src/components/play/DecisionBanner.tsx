"use client";

import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button } from "../ui/Button";
import { PrizeBadge } from "../ui/PrizeBadge";

/** Keeps tonight's pick on screen after the reveal card closes. */
export const DecisionBanner = () => {
  const mode = useGameStore((state) => state.mode);
  const decision = useGameStore((state) => state.decision);
  const reveal = useGameStore((state) => state.reveal);
  const openReveal = useGameStore((state) => state.openReveal);
  const playAgain = useGameStore((state) => state.playAgain);
  const prize = useMachineStore((state) =>
    state.config.modes.decide.prizes.find(({ id }) => id === decision),
  );

  if (mode !== "decide" || !prize || reveal) return null;

  return (
    <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
      <div className="motion-safe:animate-rise flex max-w-sm items-center gap-3 rounded-3xl bg-cream/95 p-2 pr-3 shadow-lg ring-2 ring-gold">
        <button
          type="button"
          onClick={() => openReveal(prize.id)}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <PrizeBadge prize={prize} />
          <span className="min-w-0">
            <span className="block text-xs font-bold text-olive-700">Tonight:</span>
            <span className="block truncate font-black text-olive-900">
              {prize.revealTitle}
            </span>
          </span>
        </button>
        <Button
          variant="secondary"
          className="shrink-0 px-3 py-1.5 text-sm"
          onClick={playAgain}
        >
          Play again
        </Button>
      </div>
    </div>
  );
};
