"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { PrizeConfig } from "@/game/types";

export type RegisteredPrize = {
  body: RapierRigidBody;
  prize: PrizeConfig;
};

/** Stored on each prize rigid body so the chute sensor knows what fell in. */
export type PrizeUserData = {
  key: string;
  prizeId: string;
};

type PrizeRegistry = Map<string, RegisteredPrize>;

const PrizeRegistryContext = createContext<PrizeRegistry | null>(null);

/** Live prize bodies by spawn key, shared by the prizes and the claw. */
export const PrizeRegistryProvider = ({ children }: { children: ReactNode }) => {
  const [registry] = useState<PrizeRegistry>(() => new Map());
  return <PrizeRegistryContext value={registry}>{children}</PrizeRegistryContext>;
};

export const usePrizeRegistry = () => {
  const registry = useContext(PrizeRegistryContext);
  if (!registry)
    throw new Error("usePrizeRegistry must be used inside PrizeRegistryProvider");
  return registry;
};
