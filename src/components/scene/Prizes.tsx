"use client";

import { useMemo } from "react";
import type { CabinetLayout } from "@/game/layout";
import { buildSpawnPlan } from "@/game/spawn";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Prize } from "./Prize";

type PrizesProps = {
  layout: CabinetLayout;
};

/** Spawns the current mode's prizes, minus anything already won. */
export const Prizes = ({ layout }: PrizesProps) => {
  const mode = useGameStore((state) => state.mode);
  const spawnEpoch = useGameStore((state) => state.spawnEpoch);
  const removedKeys = useGameStore((state) => state.removedKeys);
  const collected = useGameStore((state) => state.collected);
  const editMode = useGameStore((state) => state.editMode);
  const selectedPrizeId = useGameStore((state) => state.selectedPrizeId);
  const selectPrize = useGameStore((state) => state.selectPrize);
  const prizes = useMachineStore((state) => state.config.modes[mode].prizes);
  const seed = useMachineStore((state) => state.config.seed);
  const theme = useMachineStore((state) => state.config.theme);

  const inCabinet = useMemo(
    () =>
      mode === "collect" ? prizes.filter(({ id }) => !collected.includes(id)) : prizes,
    [mode, prizes, collected],
  );
  const plan = useMemo(
    () => buildSpawnPlan({ prizes: inCabinet, seed, epoch: spawnEpoch, layout }),
    [inCabinet, seed, spawnEpoch, layout],
  );
  const prizesById = useMemo(
    () => new Map(prizes.map((prize) => [prize.id, prize])),
    [prizes],
  );

  return plan
    .filter(({ key }) => !removedKeys.includes(key))
    .map((instance) => {
      const prize = prizesById.get(instance.prizeId);
      if (!prize) return null;
      return (
        <Prize
          key={`${mode}:${instance.key}`}
          instance={instance}
          prize={prize}
          theme={theme}
          highlighted={editMode && selectedPrizeId === prize.id}
          onSelect={editMode ? selectPrize : undefined}
        />
      );
    });
};
