"use client";

import { DAILY_COPY } from "@/config/copy";
import { dailyGiftStatus, giftsAllowedOn } from "@/game/daily";
import { collectProgress } from "@/game/progress";
import { useToday } from "@/hooks/useToday";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { PrizeBadge } from "../ui/PrizeBadge";
import { NextGiftCountdown } from "./NextGiftCountdown";

/** "3 of 8 gifts collected" plus every won gift, ready to reopen. */
export const GiftShelf = () => {
  const prizes = useMachineStore((state) => state.config.modes.collect.prizes);
  const giftsPerDay = useMachineStore((state) => state.config.giftsPerDay);
  const extraGifts = useMachineStore((state) => state.config.extraGifts);
  const collected = useGameStore((state) => state.collected);
  const collectedDays = useGameStore((state) => state.collectedDays);
  const openReveal = useGameStore((state) => state.openReveal);
  const setCelebrating = useGameStore((state) => state.setCelebrating);
  const today = useToday();
  const { count, total, done } = collectProgress(collected, prizes);
  const allowedToday = giftsAllowedOn({ giftsPerDay, extraGifts }, today);
  const { claimedToday, resting } = dailyGiftStatus({
    collectedDays,
    giftsPerDay: allowedToday,
    today,
  });
  const waitingToday = Math.min(allowedToday - claimedToday, total - count);
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <section
      aria-label="Gift box"
      className="mx-4 mt-2 rounded-3xl bg-cream/80 p-3 ring-1 ring-olive-300/70"
    >
      <div className="flex items-center justify-between gap-2 text-sm font-extrabold text-olive-900">
        <span>🎁 Gift box</span>
        <span className="text-olive-700">
          {done
            ? `All ${total} gifts collected 💛`
            : `${count} of ${total} gifts collected`}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-olive-100"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      {giftsPerDay > 0 && !done && (
        <p className="mt-1.5 text-xs font-bold text-olive-900">
          {resting ? (
            <>
              ✓ {DAILY_COPY.claimedToday} · {DAILY_COPY.nextGiftIn.toLowerCase()}{" "}
              <NextGiftCountdown />
            </>
          ) : (
            `🎁 ${DAILY_COPY.waiting(waitingToday)}`
          )}
        </p>
      )}
      <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {prizes.map((prize) =>
          collected.includes(prize.id) ? (
            <li key={prize.id}>
              <button
                type="button"
                onClick={() => openReveal(prize.id)}
                className="flex w-20 flex-col items-center gap-1 rounded-2xl bg-olive-100 p-2 text-xs font-bold text-olive-900 transition hover:ring-2 hover:ring-gold"
              >
                <PrizeBadge prize={prize} />
                <span className="w-full truncate text-center">{prize.name}</span>
              </button>
            </li>
          ) : (
            <li
              key={prize.id}
              aria-label="Not found yet"
              className="grid h-[60px] w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-olive-400 text-lg font-black text-olive-700"
            >
              ?
            </li>
          ),
        )}
      </ul>
      {done && (
        <button
          type="button"
          onClick={() => setCelebrating(true)}
          className="mt-1 text-sm font-extrabold text-olive-700 underline decoration-gold decoration-2 underline-offset-4"
        >
          Read my note again
        </button>
      )}
    </section>
  );
};
