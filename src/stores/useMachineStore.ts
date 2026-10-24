import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_CONFIG } from "@/config/defaultConfig";
import { newPrize } from "@/config/prizeTemplates";
import {
  addPrize,
  createPrizeId,
  duplicatePrize,
  movePrize,
  removePrize,
  updatePrize,
} from "@/game/prizeList";
import type { MachineConfig, ModeId, PrizeConfig } from "@/game/types";
import { chooseStartupConfig } from "@/lib/startupConfig";
import { createSafeStorage } from "@/lib/storage";

export const CONFIG_STORAGE_KEY = "claw-machine:config";

const STORAGE_FULL_WARNING =
  "This browser's storage is full, so the latest change wasn't saved. Try smaller or fewer photos, or use image links instead.";

type MachineStore = {
  config: MachineConfig;
  storageWarning: string | null;
  updateConfig: (patch: Partial<MachineConfig>) => void;
  setFinalMessage: (finalMessage: string) => void;
  /** Returns the new prize id. */
  addPrize: (mode: ModeId) => string;
  /** Returns the copy's id. */
  duplicatePrize: (mode: ModeId, id: string) => string;
  updatePrize: (mode: ModeId, id: string, patch: Partial<PrizeConfig>) => void;
  deletePrize: (mode: ModeId, id: string) => void;
  movePrize: (mode: ModeId, id: string, direction: -1 | 1) => void;
  importConfig: (config: MachineConfig) => void;
  /** Bumps the revision so the exported file wins over older saved configs. */
  exportConfig: () => MachineConfig;
  resetConfig: () => void;
  dismissStorageWarning: () => void;
};

const withPrizes = (
  config: MachineConfig,
  mode: ModeId,
  prizes: PrizeConfig[],
): MachineConfig => ({
  ...config,
  modes:
    mode === "decide"
      ? { ...config.modes, decide: { ...config.modes.decide, prizes } }
      : { ...config.modes, collect: { ...config.modes.collect, prizes } },
});

export const useMachineStore = create<MachineStore>()(
  persist(
    (set, get) => {
      const prizesOf = (mode: ModeId) => get().config.modes[mode].prizes;
      const takenIds = (mode: ModeId) => prizesOf(mode).map(({ id }) => id);
      const setPrizes = (mode: ModeId, prizes: PrizeConfig[]) =>
        set(({ config }) => ({ config: withPrizes(config, mode, prizes) }));

      return {
        config: DEFAULT_CONFIG,
        storageWarning: null,

        updateConfig: (patch) =>
          set(({ config }) => ({ config: { ...config, ...patch } })),
        setFinalMessage: (finalMessage) =>
          set(({ config }) => ({
            config: {
              ...config,
              modes: {
                ...config.modes,
                collect: { ...config.modes.collect, finalMessage },
              },
            },
          })),

        addPrize: (mode) => {
          const id = createPrizeId(newPrize(mode, "").name, takenIds(mode));
          setPrizes(mode, addPrize(prizesOf(mode), newPrize(mode, id)));
          return id;
        },
        duplicatePrize: (mode, id) => {
          const copyId = createPrizeId(id, takenIds(mode));
          setPrizes(mode, duplicatePrize(prizesOf(mode), id, copyId));
          return copyId;
        },
        updatePrize: (mode, id, patch) =>
          setPrizes(mode, updatePrize(prizesOf(mode), id, patch)),
        deletePrize: (mode, id) => setPrizes(mode, removePrize(prizesOf(mode), id)),
        movePrize: (mode, id, direction) =>
          setPrizes(mode, movePrize(prizesOf(mode), id, direction)),

        importConfig: (config) => set({ config }),
        exportConfig: () => {
          const config = { ...get().config, revision: get().config.revision + 1 };
          set({ config });
          return config;
        },
        resetConfig: () => set({ config: DEFAULT_CONFIG }),
        dismissStorageWarning: () => set({ storageWarning: null }),
      };
    },
    {
      name: CONFIG_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() =>
        createSafeStorage(
          () => localStorage,
          () => useMachineStore.setState({ storageWarning: STORAGE_FULL_WARNING }),
        ),
      ),
      partialize: ({ config }) => ({ config }),
      merge: (persisted, current) => ({
        ...current,
        config: chooseStartupConfig(
          (persisted as { config?: unknown } | undefined)?.config,
          DEFAULT_CONFIG,
        ),
      }),
    },
  ),
);
