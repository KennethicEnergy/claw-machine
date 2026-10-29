import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import { GOOD_GRAB_LINES, SO_CLOSE_LINES } from "@/config/copy";
import { canDrop, clawTransition, INITIAL_CLAW_STATE } from "@/game/clawMachine";
import { dayKey, isStaleDecision } from "@/game/daily";
import { resolveAttempt } from "@/game/grip";
import { mergeProgress } from "@/game/progress";
import type { AttemptResult, GripMachine, GripTarget } from "@/game/grip";
import type { ClawEvent, GameState, ModeId } from "@/game/types";
import { pickLine } from "@/lib/pickLine";
import { playSound } from "@/lib/sound";
import { createSafeStorage } from "@/lib/storage";

export const PROGRESS_STORAGE_KEY = "claw-machine:progress";

export const INITIAL_GAME_STATE: GameState = {
  mode: "decide",
  claw: INITIAL_CLAW_STATE,
  pity: 0,
  attempts: 0,
  spawnEpoch: 0,
  removedKeys: [],
  decision: null,
  decisionDay: null,
  collected: [],
  collectedDays: {},
  resting: false,
  reveal: null,
  celebrating: false,
  toast: null,
  editMode: false,
  selectedPrizeId: null,
};

export type GrabTarget = GripTarget & { key: string };

type GameActions = {
  dispatchClaw: (event: ClawEvent) => void;
  /** Starts a descent if the claw is free and nothing is waiting on her. */
  drop: () => boolean;
  /** Rolls the grip for whatever the claw closed on (or nothing). */
  resolveGrip: (target: GrabTarget | null, machine: GripMachine) => AttemptResult;
  slip: () => void;
  /** `day` defaults to today; wins are dated for the daily rhythm. */
  winPrize: (prize: { key: string; prizeId: string }, day?: string) => void;
  /** New day: yesterday's dinner pick expires so she can pick again. */
  startDay: (today: string) => void;
  setResting: (resting: boolean) => void;
  openReveal: (prizeId: string) => void;
  closeReveal: () => void;
  setCelebrating: (celebrating: boolean) => void;
  playAgain: () => void;
  respawnAll: () => void;
  resetProgress: () => void;
  /** Picks up gifts won in another copy of the app (another tab, the home-screen icon). */
  syncProgress: () => void;
  setMode: (mode: ModeId) => void;
  showToast: (text: string) => void;
  dismissToast: (id: number) => void;
  setEditMode: (editMode: boolean) => void;
  selectPrize: (prizeId: string | null) => void;
};

export type GameStore = GameState & GameActions;

/**
 * The claw waits while a card is open, during the celebration, once dinner is
 * picked, or after today's gifts are claimed.
 */
export const isPlayBlocked = ({
  reveal,
  celebrating,
  resting,
  mode,
  decision,
}: Pick<GameState, "reveal" | "celebrating" | "resting" | "mode" | "decision">) =>
  reveal !== null || celebrating || resting || (mode === "decide" && decision !== null);

type SavedProgress = Pick<
  GameState,
  | "mode"
  | "pity"
  | "attempts"
  | "decision"
  | "decisionDay"
  | "collected"
  | "collectedDays"
>;

const jsonStorage = createJSONStorage<SavedProgress>(() =>
  createSafeStorage(
    () => localStorage,
    (error) => console.warn("Could not save progress", error),
  ),
);

const readSavedProgress = () => {
  const saved = jsonStorage?.getItem(PROGRESS_STORAGE_KEY);
  return saved instanceof Promise ? undefined : saved?.state;
};

/**
 * Saves progress without dropping gifts that are already saved: another copy
 * of the app may have won them since this one loaded.
 */
const progressStorage: PersistStorage<SavedProgress> | undefined = jsonStorage && {
  ...jsonStorage,
  setItem: (name, value) =>
    jsonStorage.setItem(name, {
      ...value,
      state: { ...value.state, ...mergeProgress(value.state, readSavedProgress()) },
    }),
};

/** Fresh round: every prize respawns and the claw goes home. */
const respawned = ({ spawnEpoch }: GameState) => ({
  spawnEpoch: spawnEpoch + 1,
  removedKeys: [],
  claw: INITIAL_CLAW_STATE,
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const showToast = (text: string) =>
        set(({ toast }) => ({ toast: { id: (toast?.id ?? 0) + 1, text } }));

      const dispatchClaw = (event: ClawEvent) =>
        set(({ claw }) => {
          const next = clawTransition(claw, event);
          return next === claw ? {} : { claw: next };
        });

      return {
        ...INITIAL_GAME_STATE,
        dispatchClaw,
        showToast,

        drop: () => {
          const state = get();
          if (!canDrop(state.claw) || isPlayBlocked(state)) return false;
          dispatchClaw({ type: "DROP" });
          playSound("drop");
          return true;
        },

        resolveGrip: (target, machine) => {
          const { pity, attempts } = get();
          const result = resolveAttempt({ pity, attempts }, target, machine);
          set({ pity: result.pity, attempts: result.attempts });
          dispatchClaw({
            type: "GRIP_CLOSED",
            grabbedKey: target?.key ?? null,
            holds: result.holds,
          });
          if (result.holds) {
            showToast(pickLine(GOOD_GRAB_LINES, attempts));
            playSound("grab");
          } else if (!target) {
            showToast(pickLine(SO_CLOSE_LINES, attempts));
          }
          return result;
        },

        slip: () => {
          dispatchClaw({ type: "SLIPPED" });
          showToast(pickLine(SO_CLOSE_LINES, get().attempts));
          playSound("slip");
        },

        winPrize: ({ key, prizeId }, day = dayKey(new Date())) => {
          const { removedKeys, mode, decision, collected, collectedDays } = get();
          if (removedKeys.includes(key)) return;
          const settled = { removedKeys: [...removedKeys, key] };
          // Dinner is already decided: a stray prize just disappears.
          if (mode === "decide" && decision) return set(settled);
          const firstTime = !collected.includes(prizeId);
          set({
            ...settled,
            pity: 0,
            reveal: { mode, prizeId, fresh: true },
            ...(mode === "decide"
              ? { decision: prizeId, decisionDay: day }
              : firstTime
                ? {
                    collected: [...collected, prizeId],
                    collectedDays: { ...collectedDays, [prizeId]: day },
                  }
                : {}),
          });
          playSound("win");
        },

        startDay: (today) => {
          const { decision, decisionDay } = get();
          if (!isStaleDecision(decision, decisionDay, today)) return;
          set((state) => ({ ...respawned(state), decision: null, decisionDay: null }));
        },
        setResting: (resting) => set({ resting }),

        openReveal: (prizeId) =>
          set(({ mode }) => ({ reveal: { mode, prizeId, fresh: false } })),
        closeReveal: () => set({ reveal: null }),
        setCelebrating: (celebrating) => {
          set({ celebrating });
          if (celebrating) playSound("celebrate");
        },

        playAgain: () =>
          set((state) => ({
            ...respawned(state),
            decision: null,
            decisionDay: null,
            reveal: null,
          })),
        respawnAll: () => set(respawned),
        resetProgress: () => {
          // Clear the saved copy first, or the merge on save would bring it back.
          useGameStore.persist.clearStorage();
          set((state) => ({
            ...respawned(state),
            collected: [],
            collectedDays: {},
            decision: null,
            decisionDay: null,
            pity: 0,
            reveal: null,
            celebrating: false,
          }));
        },
        syncProgress: () => set((state) => mergeProgress(state, readSavedProgress())),

        setMode: (mode) =>
          set({
            mode,
            reveal: null,
            celebrating: false,
            removedKeys: [],
            claw: INITIAL_CLAW_STATE,
          }),

        dismissToast: (id) =>
          set(({ toast }) => (toast?.id === id ? { toast: null } : {})),
        setEditMode: (editMode) =>
          set(({ selectedPrizeId }) => ({
            editMode,
            selectedPrizeId: editMode ? selectedPrizeId : null,
          })),
        selectPrize: (selectedPrizeId) => set({ selectedPrizeId }),
      };
    },
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,
      storage: progressStorage,
      partialize: ({
        mode,
        pity,
        attempts,
        decision,
        decisionDay,
        collected,
        collectedDays,
      }) => ({
        mode,
        pity,
        attempts,
        decision,
        decisionDay,
        collected,
        collectedDays,
      }),
    },
  ),
);
