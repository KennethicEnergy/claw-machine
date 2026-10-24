"use client";

import { useCallback, useEffect } from "react";
import { REVEAL_COPY } from "@/config/copy";
import { collectProgress } from "@/game/progress";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button, buttonClass } from "../ui/Button";
import { PrizeBadge } from "../ui/PrizeBadge";

/** "You've picked…" tonight's food, or a gift with its note, popping in softly. */
export const RevealCard = () => {
  const reveal = useGameStore((state) => state.reveal);
  const collected = useGameStore((state) => state.collected);
  const closeReveal = useGameStore((state) => state.closeReveal);
  const playAgain = useGameStore((state) => state.playAgain);
  const setCelebrating = useGameStore((state) => state.setCelebrating);
  const modes = useMachineStore((state) => state.config.modes);
  const prizes = reveal ? modes[reveal.mode].prizes : [];
  const prize = prizes.find(({ id }) => id === reveal?.prizeId);

  const close = useCallback(() => {
    closeReveal();
    const lastGift = reveal?.mode === "collect" && reveal.fresh;
    if (lastGift && collectProgress(collected, modes.collect.prizes).done)
      setCelebrating(true);
  }, [reveal, collected, modes, closeReveal, setCelebrating]);

  useEffect(() => {
    if (!reveal) return;
    const handleKey = ({ key }: KeyboardEvent) => {
      if (key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reveal, close]);

  if (!reveal || !prize) return null;
  const deciding = reveal.mode === "decide";
  const { revealTitle, revealMessage, imageUrl, link, redeemNote } = prize;

  const letsGo = () => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    closeReveal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
      className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-olive-900/40 p-4 backdrop-blur-sm"
    >
      <article className="motion-safe:animate-pop w-full max-w-sm rounded-[2rem] bg-cream p-6 text-center shadow-2xl ring-4 ring-olive-300">
        <div className="flex justify-center">
          <PrizeBadge prize={prize} size="lg" opening={reveal.fresh} />
        </div>
        <p className="mt-4 text-sm font-extrabold uppercase tracking-wide text-olive-700">
          {deciding ? REVEAL_COPY.decideHeading : REVEAL_COPY.collectHeading}
        </p>
        <h2
          id="reveal-title"
          className="mt-1 text-3xl font-black leading-tight text-olive-900"
        >
          {revealTitle}
        </h2>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs and any host
          <img
            src={imageUrl}
            alt=""
            className="mt-4 max-h-52 w-full rounded-2xl object-cover ring-2 ring-olive-300"
          />
        )}
        {revealMessage && (
          <p className="mt-3 whitespace-pre-line text-base font-semibold text-olive-700">
            {revealMessage}
          </p>
        )}
        {!deciding && redeemNote && (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-gold bg-gold/10 px-4 py-3 font-extrabold text-olive-900">
            🎟️ {redeemNote}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {deciding ? (
            <>
              <Button variant="secondary" onClick={playAgain}>
                {REVEAL_COPY.playAgain}
              </Button>
              <Button variant="gold" onClick={letsGo} autoFocus>
                {REVEAL_COPY.letsGo}
              </Button>
            </>
          ) : (
            <>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("secondary")}
                >
                  {REVEAL_COPY.redeem}
                </a>
              )}
              <Button variant="gold" onClick={close} autoFocus>
                {REVEAL_COPY.keep}
              </Button>
            </>
          )}
        </div>
      </article>
    </div>
  );
};
