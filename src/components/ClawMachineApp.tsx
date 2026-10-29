"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { ClawInput } from "@/game/types";
import { useDailyRhythm } from "@/hooks/useDailyRhythm";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useProgressSync } from "@/hooks/useProgressSync";
import { useThemeVars } from "@/hooks/useThemeVars";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { EDIT_PANEL_SPACE, EditPanel } from "./edit/EditPanel";
import { Celebration } from "./play/Celebration";
import { Controls } from "./play/Controls";
import { DecisionBanner } from "./play/DecisionBanner";
import { GiftShelf } from "./play/GiftShelf";
import { Header } from "./play/Header";
import { LoadingScreen } from "./play/LoadingScreen";
import { ModeTabs } from "./play/ModeTabs";
import { PinDialog } from "./play/PinDialog";
import { RevealCard } from "./play/RevealCard";
import { Toast } from "./play/Toast";

// The 3D bundle loads on its own so the page shell shows up right away.
const MachineCanvas = dynamic(
  () => import("./scene/MachineCanvas").then(({ MachineCanvas: Canvas }) => Canvas),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Filling the machine with prizes…" />,
  },
);

const ClawMachineApp = () => {
  // Steering vector shared by keyboard, joystick and the claw's frame loop.
  const [input] = useState<ClawInput>(() => ({ x: 0, z: 0 }));
  const [pinOpen, setPinOpen] = useState(false);
  const theme = useMachineStore((state) => state.config.theme);
  const mode = useGameStore((state) => state.mode);
  const editMode = useGameStore((state) => state.editMode);
  const drop = useGameStore((state) => state.drop);
  const openPin = useCallback(() => setPinOpen(true), []);
  const handleDrop = useCallback(() => {
    drop();
  }, [drop]);

  useThemeVars(theme);
  useDailyRhythm();
  useProgressSync();
  useKeyboardControls({ input, onDrop: handleDrop, onEditShortcut: openPin });

  return (
    <main
      className={`mx-auto flex h-dvh w-full flex-col ${editMode ? EDIT_PANEL_SPACE : "max-w-3xl"}`}
    >
      <Header />
      <ModeTabs />
      <div className="relative min-h-0 flex-1">
        <MachineCanvas input={input} />
        <Toast />
        <DecisionBanner />
      </div>
      {!editMode && mode === "collect" && <GiftShelf />}
      {!editMode && <Controls input={input} />}

      {!editMode && (
        <button
          type="button"
          onClick={openPin}
          aria-label="Edit the machine"
          className="fixed bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full text-sm text-olive-700 opacity-30 transition hover:bg-olive-100 hover:opacity-100 focus-visible:opacity-100"
        >
          ✎
        </button>
      )}

      <EditPanel />
      <RevealCard />
      <Celebration />
      {pinOpen && <PinDialog onClose={() => setPinOpen(false)} />}
    </main>
  );
};

export default ClawMachineApp;
