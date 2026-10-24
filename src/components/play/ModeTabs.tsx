"use client";

import { MODE_COPY } from "@/config/copy";
import { MODE_IDS } from "@/game/types";
import { playSound } from "@/lib/sound";
import { useGameStore } from "@/stores/useGameStore";

export const ModeTabs = () => {
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <div
      role="tablist"
      aria-label="What are we playing for?"
      className="mx-auto mt-3 grid w-[calc(100%-2rem)] max-w-md grid-cols-2 gap-1 rounded-full bg-olive-100/90 p-1 ring-1 ring-olive-300/70"
    >
      {MODE_IDS.map((id) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (active) return;
              playSound("click");
              setMode(id);
            }}
            className={`rounded-full px-2 py-2 text-[13px] font-extrabold leading-tight text-balance transition sm:px-3 sm:text-base ${active ? "bg-olive-700 text-cream shadow-[0_3px_0_var(--color-olive-900)]" : "text-olive-900 hover:bg-olive-300/40"}`}
          >
            <span aria-hidden>{MODE_COPY[id].emoji}</span> {MODE_COPY[id].tab}
          </button>
        );
      })}
    </div>
  );
};
