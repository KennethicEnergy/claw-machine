"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import { prizeCollider } from "@/game/prizeGeometry";
import type { PrizeConfig, PrizeShape, ThemePalette } from "@/game/types";
import { useDispose } from "@/hooks/useDispose";
import { createLabelTexture } from "@/lib/canvasTextures";

type Vec3 = [number, number, number];

type MaterialProps = {
  color: string;
  emissive?: string;
  glow?: string;
  roughness?: number;
};

/** Soft matte plastic/felt; `glow` highlights the prize selected in the editor. */
const PrizeMaterial = ({ color, emissive, glow, roughness = 0.55 }: MaterialProps) => (
  <meshStandardMaterial
    color={color}
    roughness={roughness}
    metalness={0.04}
    emissive={glow ?? emissive ?? "#000000"}
    emissiveIntensity={glow ? 0.55 : emissive ? 0.35 : 0}
  />
);

type ShapeProps = {
  size: number;
  main: MaterialProps;
  accent: MaterialProps;
  dark: string;
};

const Sphere = ({ size, main, accent }: ShapeProps) => (
  <>
    <mesh castShadow>
      <sphereGeometry args={[size / 2, 28, 20]} />
      <PrizeMaterial {...main} />
    </mesh>
    <mesh rotation-x={Math.PI / 2}>
      <torusGeometry args={[size / 2, size * 0.03, 8, 36]} />
      <PrizeMaterial {...accent} />
    </mesh>
  </>
);

const CapsuleBall = ({ size, main, accent, dark }: ShapeProps) => (
  <>
    <mesh castShadow>
      <sphereGeometry args={[size / 2, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <PrizeMaterial {...main} roughness={0.25} />
    </mesh>
    <mesh castShadow>
      <sphereGeometry
        args={[size / 2, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
      />
      <PrizeMaterial {...accent} roughness={0.35} />
    </mesh>
    <mesh rotation-x={Math.PI / 2}>
      <torusGeometry args={[size / 2, size * 0.035, 8, 36]} />
      <meshStandardMaterial color={dark} roughness={0.4} />
    </mesh>
  </>
);

const Plush = ({ size, main, accent, dark }: ShapeProps) => (
  <>
    <mesh castShadow scale={[1, 0.86, 0.94]}>
      <sphereGeometry args={[size * 0.48, 28, 20]} />
      <PrizeMaterial {...main} roughness={0.9} />
    </mesh>
    {[-1, 1].map((side) => (
      <group key={side} position={[side * size * 0.27, size * 0.36, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.15, 16, 12]} />
          <PrizeMaterial {...main} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.01, size * 0.08]} scale={[1, 1, 0.5]}>
          <sphereGeometry args={[size * 0.085, 12, 10]} />
          <PrizeMaterial {...accent} roughness={0.9} />
        </mesh>
        <mesh position={[side * -size * 0.14, -size * 0.28, size * 0.38]}>
          <sphereGeometry args={[size * 0.035, 10, 8]} />
          <meshStandardMaterial color={dark} roughness={0.3} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -size * 0.06, size * 0.39]} scale={[1.25, 0.85, 0.6]}>
      <sphereGeometry args={[size * 0.12, 16, 12]} />
      <PrizeMaterial {...accent} roughness={0.9} />
    </mesh>
    <mesh position={[0, -size * 0.02, size * 0.46]}>
      <sphereGeometry args={[size * 0.03, 10, 8]} />
      <meshStandardMaterial color={dark} roughness={0.3} />
    </mesh>
  </>
);

const Box = ({ size, main, accent }: ShapeProps) => {
  const collider = prizeCollider("box", size);
  if (collider.kind !== "cuboid") return null;
  const [hx, hy, hz] = collider.halfExtents;
  return (
    <>
      <RoundedBox
        args={[hx * 2, hy * 2, hz * 2]}
        radius={size * 0.06}
        smoothness={3}
        castShadow
      >
        <PrizeMaterial {...main} />
      </RoundedBox>
      <mesh>
        <boxGeometry args={[hx * 2 + 0.012, hy * 0.5, hz * 2 + 0.012]} />
        <PrizeMaterial {...accent} />
      </mesh>
    </>
  );
};

const Gift = ({ size, main, accent }: ShapeProps) => {
  const half = size * 0.4;
  const ribbon = size * 0.16;
  const wrap = half * 2 + 0.012;
  return (
    <>
      <RoundedBox
        args={[half * 2, half * 2, half * 2]}
        radius={size * 0.04}
        smoothness={2}
        castShadow
      >
        <PrizeMaterial {...main} />
      </RoundedBox>
      <mesh>
        <boxGeometry args={[wrap, wrap, ribbon]} />
        <PrizeMaterial {...accent} roughness={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[ribbon, wrap, wrap]} />
        <PrizeMaterial {...accent} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          castShadow
          position={[side * size * 0.09, half + size * 0.06, 0]}
          rotation={[0, side * 0.5, side * 0.9]}
        >
          <torusGeometry args={[size * 0.09, size * 0.032, 8, 20]} />
          <PrizeMaterial {...accent} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, half + size * 0.03, 0]}>
        <sphereGeometry args={[size * 0.05, 12, 10]} />
        <PrizeMaterial {...accent} roughness={0.3} />
      </mesh>
    </>
  );
};

const Capsule = ({ size, main, accent }: ShapeProps) => {
  const collider = prizeCollider("capsule", size);
  if (collider.kind !== "capsule") return null;
  const { halfHeight, radius } = collider;
  return (
    <>
      <mesh castShadow>
        <capsuleGeometry args={[radius, halfHeight * 2, 8, 18]} />
        <PrizeMaterial {...main} roughness={0.35} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 1.03, radius * 1.03, size * 0.1, 22]} />
        <PrizeMaterial {...accent} />
      </mesh>
    </>
  );
};

const Cylinder = ({ size, main, accent }: ShapeProps) => {
  const collider = prizeCollider("cylinder", size);
  if (collider.kind !== "cylinder") return null;
  const { halfHeight, radius } = collider;
  return (
    <>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, halfHeight * 2, 26]} />
        <PrizeMaterial {...main} />
      </mesh>
      <mesh position={[0, halfHeight - size * 0.03, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.05, size * 0.09, 26]} />
        <PrizeMaterial {...accent} />
      </mesh>
    </>
  );
};

const SHAPES: Record<PrizeShape, (props: ShapeProps) => ReactNode> = {
  sphere: Sphere,
  "capsule-ball": CapsuleBall,
  plush: Plush,
  box: Box,
  gift: Gift,
  capsule: Capsule,
  cylinder: Cylinder,
};

/** Where the label sticker sits on each shape (front face, or the belly for plushies). */
const labelPlacement = (
  shape: PrizeShape,
  size: number,
): { position: Vec3; width: number } => {
  switch (shape) {
    case "sphere":
      return { position: [0, 0, size * 0.5], width: size * 0.62 };
    case "capsule-ball":
      return { position: [0, size * 0.17, size * 0.47], width: size * 0.52 };
    case "plush":
      return { position: [0, -size * 0.24, size * 0.4], width: size * 0.42 };
    case "box":
      return { position: [0, 0, size * 0.4 + 0.008], width: size * 0.66 };
    case "gift":
      return { position: [0, 0, size * 0.4 + 0.01], width: size * 0.56 };
    case "capsule":
      return { position: [0, size * 0.18, size * 0.27], width: size * 0.42 };
    case "cylinder":
      return { position: [0, -size * 0.05, size * 0.37], width: size * 0.55 };
  }
};

type LabelStickerProps = {
  text: string;
  position: Vec3;
  width: number;
  background: string;
  foreground: string;
  border: string;
};

const LabelSticker = ({
  text,
  position,
  width,
  background,
  foreground,
  border,
}: LabelStickerProps) => {
  const texture = useMemo(
    () =>
      text.trim()
        ? createLabelTexture(text.trim(), { background, foreground, border })
        : null,
    [text, background, foreground, border],
  );
  useDispose(texture);
  if (!texture) return null;
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width * 0.4375]} />
      <meshStandardMaterial
        map={texture}
        transparent
        roughness={0.7}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
};

type PrizeMeshProps = {
  prize: PrizeConfig;
  theme: ThemePalette;
  highlighted: boolean;
};

export const PrizeMesh = ({ prize, theme, highlighted }: PrizeMeshProps) => {
  const { shape, size, color, secondaryColor, emissive, label } = prize;
  const Shape = SHAPES[shape];
  const glow = highlighted ? theme.gold : undefined;
  const { position, width } = labelPlacement(shape, size);
  return (
    <>
      <Shape
        size={size}
        main={{ color, emissive, glow }}
        accent={{ color: secondaryColor, emissive, glow }}
        dark={theme.olive900}
      />
      <LabelSticker
        text={label}
        position={position}
        width={width}
        background={theme.cream}
        foreground={theme.olive900}
        border={theme.olive500}
      />
    </>
  );
};
