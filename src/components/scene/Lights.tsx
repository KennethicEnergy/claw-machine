"use client";

import { INTERIOR_LIGHT } from "@/config/theme";
import type { CabinetLayout } from "@/game/layout";
import type { ThemePalette } from "@/game/types";

type LightsProps = {
  layout: CabinetLayout;
  theme: ThemePalette;
};

/** Soft daylight from the front plus a warm lamp inside the cabinet. */
export const Lights = ({ layout: { height, halfWidth }, theme }: LightsProps) => (
  <>
    <ambientLight intensity={0.55} color={theme.cream} />
    <hemisphereLight args={[theme.cream, theme.olive700, 0.8]} />
    <directionalLight
      position={[3.5, height + 8, 7]}
      intensity={1.7}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-radius={5}
      shadow-bias={-0.0006}
      shadow-camera-left={-halfWidth - 2}
      shadow-camera-right={halfWidth + 2}
      shadow-camera-top={height + 2}
      shadow-camera-bottom={-4}
      shadow-camera-near={1}
      shadow-camera-far={40}
    />
    <pointLight
      position={[0, height - 0.7, 0.6]}
      intensity={7}
      distance={10}
      decay={1.6}
      color={INTERIOR_LIGHT}
    />
  </>
);
