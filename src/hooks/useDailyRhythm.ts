import { useEffect } from "react";
import { dailyGiftStatus, giftsAllowedOn } from "@/game/daily";
import { collectProgress } from "@/game/progress";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { useToday } from "./useToday";

/**
 * The machine's daily rhythm: dinner can be picked again each new day, and in
 * gift mode the claw rests once today's gifts are claimed.
 */
export const useDailyRhythm = () => {
  const today = useToday();
  const startDay = useGameStore((state) => state.startDay);
  const setResting = useGameStore((state) => state.setResting);
  const mode = useGameStore((state) => state.mode);
  const collected = useGameStore((state) => state.collected);
  const collectedDays = useGameStore((state) => state.collectedDays);
  const giftsPerDay = useMachineStore((state) => state.config.giftsPerDay);
  const extraGifts = useMachineStore((state) => state.config.extraGifts);
  const gifts = useMachineStore((state) => state.config.modes.collect.prizes);

  const { resting } = dailyGiftStatus({
    collectedDays,
    giftsPerDay: giftsAllowedOn({ giftsPerDay, extraGifts }, today),
    today,
  });
  const shouldRest =
    mode === "collect" && resting && !collectProgress(collected, gifts).done;

  useEffect(() => {
    startDay(today);
  }, [startDay, today]);

  useEffect(() => {
    setResting(shouldRest);
  }, [setResting, shouldRest]);
};
