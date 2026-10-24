"use client";

import { useCallback, useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { IntersectionEnterPayload } from "@react-three/rapier";
import { cabinetBoxes } from "@/game/cabinetGeometry";
import type { CabinetLayout } from "@/game/layout";
import { useGameStore } from "@/stores/useGameStore";
import type { PrizeUserData } from "./PrizeRegistry";

const isPrizeData = (value: unknown): value is PrizeUserData =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as PrizeUserData).key === "string" &&
  typeof (value as PrizeUserData).prizeId === "string";

type CabinetCollidersProps = {
  layout: CabinetLayout;
};

/** Floor, glass walls, ceiling, chute barrier and pit, plus the sensor that awards wins. */
export const CabinetColliders = ({ layout }: CabinetCollidersProps) => {
  const winPrize = useGameStore((state) => state.winPrize);
  const { floor, walls, ceiling, barrier, pit, sensor } = useMemo(
    () => cabinetBoxes(layout),
    [layout],
  );
  const solids = [...floor, ...walls, ceiling, ...barrier, ...pit];

  const handleChute = useCallback(
    ({ other }: IntersectionEnterPayload) => {
      const data = other.rigidBody?.userData;
      if (isPrizeData(data)) winPrize({ key: data.key, prizeId: data.prizeId });
    },
    [winPrize],
  );

  return (
    <RigidBody type="fixed" colliders={false}>
      {solids.map(({ position, halfExtents }) => (
        <CuboidCollider
          key={position.join(",")}
          args={halfExtents}
          position={position}
          friction={0.8}
        />
      ))}
      <CuboidCollider
        sensor
        args={sensor.halfExtents}
        position={sensor.position}
        onIntersectionEnter={handleChute}
      />
    </RigidBody>
  );
};
