"use client";

import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { MeshStandardMaterial } from "three";
import {
  CABINET_BASE_HEIGHT,
  CABINET_TRIM,
  CHUTE_BARRIER_HEIGHT,
  MARQUEE_HEIGHT,
} from "@/config/machine";
import { cabinetBoxes } from "@/game/cabinetGeometry";
import type { CabinetLayout } from "@/game/layout";
import type { ThemePalette } from "@/game/types";
import { useDispose } from "@/hooks/useDispose";
import { useGameStore } from "@/stores/useGameStore";
import { createDotsTexture, createSignTexture } from "@/lib/canvasTextures";
import { mixHex } from "@/lib/color";

type Vec3 = [number, number, number];

const FLOOR_SLAB = 0.25;
const SIGN_ASPECT = 4;

type NeonTrimProps = {
  size: Vec3;
  position: Vec3;
  color: string;
  pulse: boolean;
  phase?: number;
};

/** Glowing trim strip; gently breathes unless reduced motion is on. */
const NeonTrim = ({ size, position, color, pulse, phase = 0 }: NeonTrimProps) => {
  const material = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!pulse || !material.current) return;
    material.current.emissiveIntensity =
      1.3 + Math.sin(clock.elapsedTime * 1.8 + phase) * 0.45;
  });
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        ref={material}
        color={color}
        emissive={color}
        emissiveIntensity={1.3}
        toneMapped={false}
      />
    </mesh>
  );
};

type GlassProps = {
  size: [number, number];
  position: Vec3;
  rotationY?: number;
};

/** Cheap glass: a faint transparent pane, no transmission. */
const Glass = ({ size, position, rotationY = 0 }: GlassProps) => (
  <mesh position={position} rotation-y={rotationY} renderOrder={2}>
    <planeGeometry args={size} />
    <meshStandardMaterial
      color="#ffffff"
      transparent
      opacity={0.07}
      roughness={0.05}
      depthWrite={false}
      side={DoubleSide}
    />
  </mesh>
);

type CabinetShellProps = {
  layout: CabinetLayout;
  theme: ThemePalette;
  title: string;
  pulse: boolean;
};

export const CabinetShell = ({ layout, theme, title, pulse }: CabinetShellProps) => {
  const { halfWidth, halfDepth, height, chute } = layout;
  const shattered = useGameStore((state) => state.shattered);
  const width = halfWidth * 2;
  const depth = halfDepth * 2;
  const outerWidth = width + CABINET_TRIM * 2;
  const outerDepth = depth + CABINET_TRIM * 2;
  const front = halfDepth + CABINET_TRIM;
  const { floor, barrier } = useMemo(() => cabinetBoxes(layout), [layout]);

  const signTexture = useMemo(
    () =>
      createSignTexture(title, {
        panel: theme.olive900,
        text: theme.cream,
        accent: theme.gold,
      }),
    [title, theme.olive900, theme.cream, theme.gold],
  );
  useDispose(signTexture);

  const dotsTexture = useMemo(
    () =>
      createDotsTexture(
        theme.olive500,
        mixHex(theme.olive500, theme.olive300, 0.45),
        width / 0.8,
        height / 0.8,
      ),
    [theme.olive500, theme.olive300, width, height],
  );
  useDispose(dotsTexture);

  const floorColor = mixHex(theme.olive100, theme.olive300, 0.3);
  const signHeight = MARQUEE_HEIGHT * 0.78;
  const signWidth = Math.min(width * 0.92, signHeight * SIGN_ASPECT);

  return (
    <group>
      {/* Base with the prize door */}
      <RoundedBox
        args={[outerWidth, CABINET_BASE_HEIGHT, outerDepth]}
        radius={0.14}
        smoothness={3}
        position={[0, -CABINET_BASE_HEIGHT / 2 - FLOOR_SLAB, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={theme.olive700} roughness={0.7} />
      </RoundedBox>
      {/* Rim around the glass, level with the play floor */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, -FLOOR_SLAB / 2, side * (halfDepth + CABINET_TRIM / 2)]}>
            <boxGeometry args={[outerWidth - 0.1, FLOOR_SLAB, CABINET_TRIM]} />
            <meshStandardMaterial color={theme.olive700} roughness={0.7} />
          </mesh>
          <mesh position={[side * (halfWidth + CABINET_TRIM / 2), -FLOOR_SLAB / 2, 0]}>
            <boxGeometry args={[CABINET_TRIM, FLOOR_SLAB, depth]} />
            <meshStandardMaterial color={theme.olive700} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <RoundedBox
        args={[chute.size * 0.85, 0.95, 0.08]}
        radius={0.04}
        position={[chute.x, -1.35, front]}
      >
        <meshStandardMaterial color={theme.olive900} roughness={0.6} />
      </RoundedBox>
      <mesh position={[chute.x, -0.98, front + 0.06]}>
        <boxGeometry args={[chute.size * 0.4, 0.07, 0.05]} />
        <meshStandardMaterial color={theme.gold} metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Floor around the chute hole, and the dark hole itself */}
      {floor.map(({ position: [x, , z], halfExtents: [hx, , hz] }) => (
        <mesh key={`${x},${z}`} position={[x, -FLOOR_SLAB / 2, z]} receiveShadow>
          <boxGeometry args={[hx * 2, FLOOR_SLAB, hz * 2]} />
          <meshStandardMaterial color={floorColor} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[chute.x, -0.2, chute.z]}>
        <boxGeometry args={[chute.size, 0.1, chute.size]} />
        <meshStandardMaterial color={theme.olive900} roughness={1} />
      </mesh>

      {/* Clear acrylic barrier around the chute */}
      {barrier.map(({ position, halfExtents: [hx, hy, hz] }) => (
        <group key={position.join(",")}>
          <mesh position={position} renderOrder={1}>
            <boxGeometry args={[hx * 2, hy * 2, hz * 2]} />
            <meshStandardMaterial
              color={theme.cream}
              transparent
              opacity={0.35}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[position[0], CHUTE_BARRIER_HEIGHT, position[2]]}>
            <boxGeometry args={[hx * 2 + 0.02, 0.05, hz * 2 + 0.02]} />
            <meshStandardMaterial color={theme.olive300} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Polka-dot back wall */}
      <mesh position={[0, height / 2, -halfDepth + 0.01]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={dotsTexture} roughness={0.9} />
      </mesh>

      {/* Glass; the front pane is gone once the easter egg breaks it */}
      {!shattered && (
        <Glass size={[width, height]} position={[0, height / 2, halfDepth]} />
      )}
      <Glass
        size={[depth, height]}
        position={[-halfWidth, height / 2, 0]}
        rotationY={Math.PI / 2}
      />
      <Glass
        size={[depth, height]}
        position={[halfWidth, height / 2, 0]}
        rotationY={Math.PI / 2}
      />
      {!shattered &&
        [0.32, 0.4].map((offset, index) => (
          <mesh
            key={offset}
            position={[halfWidth * offset, height * 0.62, halfDepth + 0.01]}
            rotation-z={-0.55}
            renderOrder={3}
          >
            <planeGeometry args={[0.12 + index * 0.1, height * 0.55]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
        ))}

      {/* Corner posts */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <RoundedBox
            key={`${sx},${sz}`}
            args={[0.28, height + 0.1, 0.28]}
            radius={0.08}
            position={[sx * (halfWidth + 0.06), height / 2, sz * (halfDepth + 0.06)]}
            castShadow
          >
            <meshStandardMaterial color={theme.olive700} roughness={0.65} />
          </RoundedBox>
        )),
      )}

      {/* Top rails for the claw gantry */}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, height - 0.15, sz * (halfDepth - 0.12)]}>
          <boxGeometry args={[width - 0.1, 0.08, 0.08]} />
          <meshStandardMaterial color={theme.olive900} metalness={0.4} roughness={0.45} />
        </mesh>
      ))}

      {/* Marquee with the title */}
      <RoundedBox
        args={[outerWidth, MARQUEE_HEIGHT, outerDepth]}
        radius={0.14}
        smoothness={3}
        position={[0, height + MARQUEE_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial color={theme.olive700} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, height + MARQUEE_HEIGHT / 2, front + 0.005]}>
        <planeGeometry args={[signWidth, signHeight]} />
        <meshStandardMaterial map={signTexture} roughness={0.6} transparent />
      </mesh>

      {/* Neon trim */}
      <NeonTrim
        size={[outerWidth - 0.2, 0.05, 0.05]}
        position={[0, 0.02, front - 0.02]}
        color={theme.olive300}
        pulse={pulse}
      />
      <NeonTrim
        size={[outerWidth - 0.2, 0.05, 0.05]}
        position={[0, height + 0.04, front - 0.02]}
        color={theme.olive300}
        pulse={pulse}
        phase={Math.PI}
      />
      {[-1, 1].map((sx) => (
        <NeonTrim
          key={sx}
          size={[0.05, height - 0.1, 0.05]}
          position={[sx * (halfWidth + 0.06), height / 2, front - 0.09]}
          color={theme.olive400}
          pulse={pulse}
          phase={sx}
        />
      ))}
    </group>
  );
};
