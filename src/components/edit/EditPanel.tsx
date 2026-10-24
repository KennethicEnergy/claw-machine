"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "../ui/Button";
import { DataTools } from "./DataTools";
import { MachineSettings } from "./MachineSettings";
import { PrizeListEditor } from "./PrizeListEditor";

const TABS = [
  { id: "prizes", label: "Prizes" },
  { id: "machine", label: "Machine" },
  { id: "data", label: "Data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Width of the desktop side panel; the page leaves room for it in edit mode. */
export const EDIT_PANEL_SPACE = "pb-[58dvh] sm:pb-0 sm:pr-[400px]";

export const EditPanel = () => {
  const editMode = useGameStore((state) => state.editMode);
  const mode = useGameStore((state) => state.mode);
  const setEditMode = useGameStore((state) => state.setEditMode);
  const selectedPrizeId = useGameStore((state) => state.selectedPrizeId);
  const [tab, setTab] = useState<TabId>("prizes");
  const [lastSelected, setLastSelected] = useState(selectedPrizeId);

  // Tapping a prize in the machine jumps to its editor.
  if (selectedPrizeId !== lastSelected) {
    setLastSelected(selectedPrizeId);
    if (selectedPrizeId) setTab("prizes");
  }

  if (!editMode) return null;

  return (
    <aside
      aria-label="Edit the machine"
      className="fixed inset-x-0 bottom-0 z-20 flex h-[58dvh] flex-col rounded-t-3xl bg-olive-100 shadow-[0_-12px_40px_rgb(47_58_23/0.25)] sm:inset-y-0 sm:left-auto sm:h-auto sm:w-[400px] sm:rounded-none sm:rounded-l-3xl"
    >
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
        <div>
          <h2 className="text-lg font-black text-olive-900">Machine keeper</h2>
          <p className="text-xs text-olive-700">Changes save on this device as you go.</p>
        </div>
        <Button variant="gold" className="px-4 py-2" onClick={() => setEditMode(false)}>
          Done
        </Button>
      </header>
      <nav className="mx-5 grid grid-cols-3 gap-1 rounded-full bg-cream p-1 ring-1 ring-olive-300/60">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`rounded-full py-1.5 text-sm font-extrabold transition ${tab === id ? "bg-olive-700 text-cream" : "text-olive-900 hover:bg-olive-300/30"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-4">
        {tab === "prizes" && <PrizeListEditor mode={mode} />}
        {tab === "machine" && <MachineSettings />}
        {tab === "data" && <DataTools />}
      </div>
    </aside>
  );
};
