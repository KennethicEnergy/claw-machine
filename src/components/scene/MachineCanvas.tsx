"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { cabinetLayout } from "@/game/layout";
import type { ClawInput } from "@/game/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { CabinetColliders } from "./CabinetColliders";
import { CabinetShell } from "./CabinetShell";
import { CameraRig } from "./CameraRig";
import { Claw } from "./Claw";
import { Lights } from "./Lights";
import { PrizeRegistryProvider } from "./PrizeRegistry";
import { Prizes } from "./Prizes";

type MachineCanvasProps = {
  input: ClawInput;
};

export const MachineCanvas = ({ input }: MachineCanvasProps) => {
  const cabinet = useMachineStore((state) => state.config.cabinet);
  const theme = useMachineStore((state) => state.config.theme);
  const title = useMachineStore((state) => state.config.title);
  const gravity = useMachineStore((state) => state.config.gravity);
  const editMode = useGameStore((state) => state.editMode);
  const selectPrize = useGameStore((state) => state.selectPrize);
  const reducedMotion = usePrefersReducedMotion();
  const layout = useMemo(() => cabinetLayout(cabinet), [cabinet]);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.1, far: 120, position: [0, 4, 18] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="touch-none"
      onPointerMissed={() => {
        if (editMode) selectPrize(null);
      }}
    >
      <Lights layout={layout} theme={theme} />
      <CameraRig layout={layout} editMode={editMode} />
      <CabinetShell layout={layout} theme={theme} title={title} pulse={!reducedMotion} />
      <Suspense fallback={null}>
        <Physics gravity={[0, -gravity, 0]}>
          <PrizeRegistryProvider>
            <CabinetColliders layout={layout} />
            <Prizes layout={layout} />
            <Claw layout={layout} input={input} theme={theme} />
          </PrizeRegistryProvider>
        </Physics>
      </Suspense>
    </Canvas>
  );
};
