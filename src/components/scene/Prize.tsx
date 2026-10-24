"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { prizeCollider } from "@/game/prizeGeometry";
import type { SpawnInstance } from "@/game/spawn";
import type { PrizeConfig, ThemePalette } from "@/game/types";
import { PrizeMesh } from "./PrizeMesh";
import { usePrizeRegistry } from "./PrizeRegistry";
import type { PrizeUserData } from "./PrizeRegistry";

type PrizeColliderProps = {
  prize: PrizeConfig;
};

/** Collider matching the mesh; slippery prizes get less friction. */
const PrizeCollider = ({
  prize: { shape, size, weight, slipperiness },
}: PrizeColliderProps) => {
  const collider = prizeCollider(shape, size);
  const physics = { mass: weight, friction: 1 - slipperiness * 0.8, restitution: 0.08 };
  switch (collider.kind) {
    case "ball":
      return <BallCollider args={[collider.radius]} {...physics} />;
    case "cuboid":
      return <CuboidCollider args={collider.halfExtents} {...physics} />;
    case "capsule":
      return (
        <CapsuleCollider args={[collider.halfHeight, collider.radius]} {...physics} />
      );
    case "cylinder":
      return (
        <CylinderCollider args={[collider.halfHeight, collider.radius]} {...physics} />
      );
  }
};

type PrizeProps = {
  instance: SpawnInstance;
  prize: PrizeConfig;
  theme: ThemePalette;
  highlighted: boolean;
  onSelect?: (prizeId: string) => void;
};

export const Prize = ({ instance, prize, theme, highlighted, onSelect }: PrizeProps) => {
  const registry = usePrizeRegistry();
  const bodyRef = useRef<RapierRigidBody>(null);
  // Frozen at mount: changing position props later would teleport the body.
  const [{ position, rotation }] = useState(() => instance);
  const { key } = instance;
  const userData = useMemo<PrizeUserData>(
    () => ({ key, prizeId: prize.id }),
    [key, prize.id],
  );

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    registry.set(key, { body, prize });
    return () => {
      registry.delete(key);
    };
  }, [registry, key, prize]);

  const handleClick = onSelect
    ? (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(prize.id);
      }
    : undefined;

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      rotation={rotation}
      colliders={false}
      userData={userData}
      linearDamping={0.35}
      angularDamping={0.6}
    >
      <PrizeCollider prize={prize} />
      <group onClick={handleClick}>
        <PrizeMesh prize={prize} theme={theme} highlighted={highlighted} />
      </group>
    </RigidBody>
  );
};
