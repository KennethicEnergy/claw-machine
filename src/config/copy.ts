import type { ModeId } from "@/game/types";

export const MODE_COPY: Record<ModeId, { tab: string; hint: string; emoji: string }> = {
  decide: { tab: "What do you want to eat?", hint: "Let's find dinner", emoji: "🍜" },
  collect: { tab: "Your gifts", hint: "There's something in here for you", emoji: "🎁" },
};

export const SO_CLOSE_LINES = [
  "So close, try again",
  "Ooh, almost! One more go?",
  "It wiggled free. So close, try again",
  "Nearly had it. The claw is warming up to you",
] as const;

export const GOOD_GRAB_LINES = [
  "Oh, a good one!",
  "Got it, hold on tight…",
  "Ooh, here it comes!",
] as const;

export const REVEAL_COPY = {
  decideHeading: "You've picked:",
  collectHeading: "A little something for you:",
  playAgain: "Play again",
  letsGo: "Let's go",
  keep: "Keep it",
  redeem: "Redeem",
} as const;

export const CONTROL_COPY = {
  drop: "Drop!",
  busy: "Hold on…",
  decided: "Decided!",
  allCollected: "All yours 💛",
  keyboardHint: "Arrows / WASD to move · Space to drop",
} as const;

export const DAILY_COPY = {
  restingButton: "See you tomorrow",
  restingHint: "That's today's gift 💛",
  nextGiftIn: "Next one unlocks in",
  claimedToday: "Today's gift is yours",
  waiting: (count: number) =>
    `${count} ${count === 1 ? "gift" : "gifts"} waiting for you today`,
} as const;
