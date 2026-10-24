"use client";

import { MODE_COPY } from "@/config/copy";
import { MODE_IDS } from "@/game/types";
import type { ModeId } from "@/game/types";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button } from "../ui/Button";
import { PrizeBadge } from "../ui/PrizeBadge";
import { PrizeEditor } from "./PrizeEditor";

const ICON_BUTTON =
  "grid h-8 w-8 place-items-center rounded-full text-olive-700 transition hover:bg-olive-300/40 disabled:opacity-30";

type PrizeListEditorProps = {
  mode: ModeId;
};

export const PrizeListEditor = ({ mode }: PrizeListEditorProps) => {
  const prizes = useMachineStore((state) => state.config.modes[mode].prizes);
  const addPrize = useMachineStore((state) => state.addPrize);
  const duplicatePrize = useMachineStore((state) => state.duplicatePrize);
  const deletePrize = useMachineStore((state) => state.deletePrize);
  const movePrize = useMachineStore((state) => state.movePrize);
  const selectedPrizeId = useGameStore((state) => state.selectedPrizeId);
  const selectPrize = useGameStore((state) => state.selectPrize);
  const setMode = useGameStore((state) => state.setMode);
  const selected = prizes.find(({ id }) => id === selectedPrizeId);

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from the machine?`)) return;
    deletePrize(mode, id);
    if (selectedPrizeId === id) selectPrize(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1 ring-1 ring-olive-300/60">
        {MODE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              selectPrize(null);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-extrabold transition ${id === mode ? "bg-olive-700 text-cream" : "text-olive-900 hover:bg-olive-300/30"}`}
          >
            {MODE_COPY[id].emoji} {id === "decide" ? "Dinner" : "Gifts"}
          </button>
        ))}
      </div>

      <ul className="space-y-1.5">
        {prizes.map(({ id, name, shape, color, secondaryColor, spawnCount }, index) => (
          <li
            key={id}
            className={`flex items-center gap-2 rounded-2xl p-1.5 pr-1 ring-2 transition ${id === selectedPrizeId ? "bg-cream ring-gold" : "bg-cream/60 ring-transparent"}`}
          >
            <button
              type="button"
              onClick={() => selectPrize(id === selectedPrizeId ? null : id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <PrizeBadge prize={{ shape, color, secondaryColor }} />
              <span className="min-w-0">
                <span className="block truncate font-extrabold text-olive-900">
                  {name}
                </span>
                <span className="text-xs text-olive-700">
                  ×{spawnCount} in the machine
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-label={`Move ${name} up`}
              className={ICON_BUTTON}
              disabled={index === 0}
              onClick={() => movePrize(mode, id, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${name} down`}
              className={ICON_BUTTON}
              disabled={index === prizes.length - 1}
              onClick={() => movePrize(mode, id, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`Duplicate ${name}`}
              className={ICON_BUTTON}
              onClick={() => selectPrize(duplicatePrize(mode, id))}
            >
              ⧉
            </button>
            <button
              type="button"
              aria-label={`Delete ${name}`}
              className={ICON_BUTTON}
              onClick={() => handleDelete(id, name)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => selectPrize(addPrize(mode))}
      >
        + Add a {mode === "decide" ? "place" : "gift"}
      </Button>

      {selected ? (
        <PrizeEditor key={`${mode}:${selected.id}`} mode={mode} prize={selected} />
      ) : (
        <p className="text-center text-sm text-olive-700">
          Pick a prize above, or tap one inside the machine, to edit it.
        </p>
      )}
    </div>
  );
};
