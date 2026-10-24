"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  interactionGroups,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import type { Group, Mesh } from "three";
import { CLAW_GEOMETRY, CLAW_GRAB_RADIUS, CLAW_MOTION } from "@/config/machine";
import {
  createClawMotion,
  descentStopY,
  prongAngle,
  stepClawMotion,
  tipOffset,
} from "@/game/clawMotion";
import type { ClawSignal } from "@/game/clawMotion";
import { assistRadius } from "@/game/grip";
import type { CabinetLayout } from "@/game/layout";
import { findGrabTarget } from "@/game/pick";
import type { PrizeBody } from "@/game/pick";
import { prizeRadius } from "@/game/prizeGeometry";
import { createRng, randomRange, seedFor } from "@/game/rng";
import type { ClawInput, ThemePalette } from "@/game/types";
import { segmentTransform } from "@/lib/segment";
import { isPlayBlocked, useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { usePrizeRegistry } from "./PrizeRegistry";
import type { RegisteredPrize } from "./PrizeRegistry";

const PRONG_YAWS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
const { hubRadius, hingeRadius, hingeDrop, knee, tip, prongThickness } = CLAW_GEOMETRY;
const SEGMENTS = [segmentTransform({ x: 0, y: 0 }, knee), segmentTransform(knee, tip)];
const HUB_TOP = 0.32;
const STILL: ClawInput = { x: 0, z: 0 };
/** Separates the slip roll from the grip roll for the same attempt. */
const SLIP_SALT = 7777;

/**
 * Prongs live in their own collision group. The prize the claw is going for
 * filters that group out, so the prongs can't shove it out from under the claw
 * (neighbors still get nudged).
 */
const PRONG_GROUP = 1;
const PRONG_GROUPS = interactionGroups([PRONG_GROUP]);
const IGNORES_PRONGS = interactionGroups(
  [0],
  Array.from({ length: 16 }, (_, group) => group).filter(
    (group) => group !== PRONG_GROUP,
  ),
);
const DEFAULT_GROUPS = 0xffffffff;

const setCollisionGroups = (body: RapierRigidBody, groups: number) => {
  for (let index = 0; index < body.numColliders(); index += 1) {
    body.collider(index).setCollisionGroups(groups);
  }
};

type Held = {
  key: string;
  body: RapierRigidBody;
  radius: number;
  offset: Vector3;
  /** Hub height at which a losing grab lets go; null when it holds. */
  slipAtY: number | null;
};

type Target = PrizeBody;

type ProngColliderProps = {
  bodyRef: (body: RapierRigidBody | null) => void;
};

/** Invisible kinematic prong that pushes prizes; its visual twin lives on the hub. */
const ProngCollider = ({ bodyRef }: ProngColliderProps) => (
  <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false}>
    {SEGMENTS.map(({ position, rotationZ, length }, index) => (
      <CapsuleCollider
        key={index}
        args={[length / 2, prongThickness]}
        position={position}
        rotation={[0, 0, rotationZ]}
        friction={1.2}
        collisionGroups={PRONG_GROUPS}
      />
    ))}
  </RigidBody>
);

type ProngVisualProps = {
  groupRef: (group: Group | null) => void;
  metal: string;
  accent: string;
};

const ProngVisual = ({ groupRef, metal, accent }: ProngVisualProps) => (
  <group ref={groupRef}>
    {SEGMENTS.map(({ position, rotationZ, length }, index) => (
      <mesh key={index} position={position} rotation-z={rotationZ} castShadow>
        <capsuleGeometry args={[prongThickness, length, 4, 10]} />
        <meshStandardMaterial color={metal} metalness={0.6} roughness={0.3} />
      </mesh>
    ))}
    <mesh position={[knee.x, knee.y, 0]}>
      <sphereGeometry args={[prongThickness * 1.5, 12, 10]} />
      <meshStandardMaterial color={accent} metalness={0.5} roughness={0.35} />
    </mesh>
  </group>
);

type ClawProps = {
  layout: CabinetLayout;
  input: ClawInput;
  theme: ThemePalette;
};

export const Claw = ({ layout, input, theme }: ClawProps) => {
  const registry = usePrizeRegistry();
  const { rapier } = useRapier();
  const motion = useRef(createClawMotion(layout));
  const held = useRef<Held | null>(null);
  const target = useRef<Target | null>(null);
  const prongBodies = useRef<(RapierRigidBody | null)[]>([null, null, null]);
  const prongVisuals = useRef<(Group | null)[]>([null, null, null]);
  const hub = useRef<Group>(null);
  const cable = useRef<Mesh>(null);
  const gantry = useRef<Group>(null);
  const bridge = useRef<Mesh>(null);
  const marker = useRef<Group>(null);
  const scratch = useMemo(
    () => ({
      yaw: new Quaternion(),
      tilt: new Quaternion(),
      rotation: new Quaternion(),
      point: new Vector3(),
      up: new Vector3(0, 1, 0),
      tangent: new Vector3(0, 0, 1),
    }),
    [],
  );

  /** The prize the open claw would close on right now (with pity widening its reach). */
  const scanUnderClaw = useCallback((): Target | null => {
    const { pity } = useGameStore.getState();
    const { pityThreshold } = useMachineStore.getState().config;
    const bodies: Target[] = [];
    registry.forEach(({ body, prize }, key) => {
      if (body.isKinematic()) return;
      const { x, y, z } = body.translation();
      bodies.push({ key, x, y, z, radius: prizeRadius(prize.size) });
    });
    const reach = assistRadius(CLAW_GRAB_RADIUS, pity, pityThreshold);
    return findGrabTarget(motion.current, bodies, reach);
  }, [registry]);

  /** Locks the claw onto the prize it is going for, or lets go of the lock. */
  const lockTarget = useCallback(
    (next: Target | null) => {
      const previous = target.current && registry.get(target.current.key);
      if (previous) setCollisionGroups(previous.body, DEFAULT_GROUPS);
      target.current = next;
      const locked = next && registry.get(next.key);
      if (locked) setCollisionGroups(locked.body, IGNORES_PRONGS);
    },
    [registry],
  );

  /** Where the locked target is now, or null if it has left the machine. */
  const followTarget = (): Target | null => {
    const locked = target.current;
    const entry = locked && registry.get(locked.key);
    if (!locked || !entry) return null;
    const { x, y, z } = entry.body.translation();
    return { ...locked, x, y, z };
  };

  const release = useCallback(
    (wiggle: boolean) => {
      const current = held.current;
      held.current = null;
      if (!current || !registry.has(current.key)) return;
      const { body } = current;
      body.setBodyType(rapier.RigidBodyType.Dynamic, true);
      body.setLinvel(
        wiggle ? { x: 0.5, y: 0.8, z: -0.4 } : { x: 0, y: -0.6, z: 0 },
        true,
      );
      body.setAngvel(wiggle ? { x: 2.5, y: 0.5, z: -2 } : { x: 0, y: 0, z: 0 }, true);
    },
    [rapier, registry],
  );

  const grab = useCallback(
    (key: string, { body, prize }: RegisteredPrize, holds: boolean, attempt: number) => {
      const { seed } = useMachineStore.getState().config;
      const { x, y, z } = body.translation();
      const claw = motion.current;
      const lift = randomRange(
        createRng(seedFor(seed, attempt + SLIP_SALT)),
        CLAW_MOTION.slipLiftMin,
        CLAW_MOTION.slipLiftMax,
      );
      body.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true);
      held.current = {
        key,
        body,
        radius: prizeRadius(prize.size),
        offset: new Vector3(x - claw.x, y - claw.y, z - claw.z),
        slipAtY: holds ? null : Math.min(claw.y + lift, layout.restY - 0.05),
      };
    },
    [rapier, layout],
  );

  /** Teleports the claw home and lets go of anything it was carrying. */
  const reset = useCallback(() => {
    release(false);
    lockTarget(null);
    Object.assign(motion.current, createClawMotion(layout));
    const { x, y, z } = motion.current;
    prongBodies.current.forEach((body) =>
      body?.setTranslation({ x, y: y - hingeDrop, z }, true),
    );
  }, [layout, release, lockTarget]);

  useEffect(() => {
    reset();
    return useGameStore.subscribe((state, previous) => {
      if (state.mode !== previous.mode || state.spawnEpoch !== previous.spawnEpoch)
        reset();
    });
  }, [reset]);

  const handleSignal = (signal: ClawSignal) => {
    const game = useGameStore.getState();
    switch (signal) {
      case "GRIP_DONE": {
        const { clawStrength, pityThreshold, seed } = useMachineStore.getState().config;
        const key = target.current?.key;
        const entry = key ? registry.get(key) : undefined;
        const grabbed = key && entry ? { key, ...entry } : null;
        const { holds, attempts } = game.resolveGrip(
          grabbed && {
            key: grabbed.key,
            weight: grabbed.prize.weight,
            slipperiness: grabbed.prize.slipperiness,
          },
          { clawStrength, pityThreshold, seed },
        );
        if (grabbed) grab(grabbed.key, grabbed, holds, attempts);
        else lockTarget(null);
        return;
      }
      case "REACHED_CHUTE":
        release(false);
        game.dispatchClaw({ type: signal });
        return;
      case "RELEASED":
        lockTarget(null);
        game.dispatchClaw({ type: signal });
        return;
      default:
        game.dispatchClaw({ type: signal });
    }
  };

  /** Moves a grabbed prize with the claw, easing it into the fingers, or lets it slip. */
  const carryHeld = (dt: number) => {
    const current = held.current;
    if (!current) return;
    if (!registry.has(current.key)) {
      held.current = null;
      return;
    }
    const claw = motion.current;
    if (current.slipAtY !== null && claw.y >= current.slipAtY) {
      release(true);
      useGameStore.getState().slip();
      return;
    }
    const ease = 1 - Math.exp(-6 * dt);
    const restY = -tipOffset(prongAngle(1, current.radius)).drop + current.radius * 0.35;
    const { offset } = current;
    offset.x -= offset.x * ease;
    offset.z -= offset.z * ease;
    offset.y += (restY - offset.y) * ease;
    scratch.point.set(claw.x + offset.x, claw.y + offset.y, claw.z + offset.z);
    current.body.setNextKinematicTranslation(scratch.point);
  };

  const pose = (showMarker: boolean, under: Target | null) => {
    const claw = motion.current;
    hub.current?.position.set(claw.x, claw.y, claw.z);
    gantry.current?.position.set(claw.x, layout.railY, claw.z);
    bridge.current?.position.set(claw.x, layout.railY - 0.15, 0);

    const cableTop = layout.railY - 0.2;
    const cableBottom = claw.y + HUB_TOP;
    const cableLength = Math.max(0.01, cableTop - cableBottom);
    cable.current?.position.set(claw.x, cableBottom + cableLength / 2, claw.z);
    cable.current?.scale.set(1, cableLength, 1);

    const heldRadius = held.current?.radius ?? target.current?.radius ?? null;
    const angle = prongAngle(claw.grip, heldRadius);
    scratch.tilt.setFromAxisAngle(scratch.tangent, angle);
    PRONG_YAWS.forEach((yaw, index) => {
      scratch.yaw.setFromAxisAngle(scratch.up, yaw);
      scratch.rotation.copy(scratch.yaw).multiply(scratch.tilt);
      const localX = Math.cos(yaw) * hingeRadius;
      const localZ = -Math.sin(yaw) * hingeRadius;
      const visual = prongVisuals.current[index];
      visual?.position.set(localX, -hingeDrop, localZ);
      visual?.quaternion.copy(scratch.rotation);
      scratch.point.set(claw.x + localX, claw.y - hingeDrop, claw.z + localZ);
      const body = prongBodies.current[index];
      body?.setNextKinematicTranslation(scratch.point);
      body?.setNextKinematicRotation(scratch.rotation);
    });

    if (marker.current) {
      marker.current.visible = showMarker;
      marker.current.position.set(
        claw.x,
        (under ? under.y + under.radius : 0) + 0.03,
        claw.z,
      );
      // Gold ring = a prize is in reach; faint ring = this drop would come up empty.
      const [lockedOn, empty] = marker.current.children;
      lockedOn.visible = under !== null;
      empty.visible = under === null;
    }
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const game = useGameStore.getState();
    const { phase } = game.claw;
    const blocked = isPlayBlocked(game);
    const steering = phase === "idle" || phase === "moving";
    if (phase === "descending" && !target.current) lockTarget(scanUnderClaw());
    const under = steering ? scanUnderClaw() : followTarget();
    const signal = stepClawMotion(motion.current, phase, {
      layout,
      input: blocked ? STILL : input,
      moveSpeed: useMachineStore.getState().config.clawSpeed,
      dt,
      stopY: descentStopY(under),
    });
    if (signal) handleSignal(signal);
    carryHeld(dt);
    pose(steering && !blocked, under);
  });

  const metal = theme.cream;
  return (
    <>
      {PRONG_YAWS.map((yaw, index) => (
        <ProngCollider
          key={yaw}
          bodyRef={(body) => {
            prongBodies.current[index] = body;
          }}
        />
      ))}

      <mesh ref={bridge}>
        <boxGeometry args={[0.12, 0.1, layout.halfDepth * 2 - 0.1]} />
        <meshStandardMaterial color={theme.olive900} metalness={0.4} roughness={0.45} />
      </mesh>

      <group ref={gantry}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.42]} />
          <meshStandardMaterial color={theme.olive900} metalness={0.4} roughness={0.45} />
        </mesh>
      </group>

      <mesh ref={cable}>
        <cylinderGeometry args={[0.025, 0.025, 1, 8]} />
        <meshStandardMaterial color={theme.olive900} metalness={0.3} roughness={0.6} />
      </mesh>

      <group ref={hub}>
        <mesh castShadow position={[0, 0.08, 0]}>
          <cylinderGeometry args={[hubRadius * 0.85, hubRadius, 0.3, 24]} />
          <meshStandardMaterial color={metal} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry
            args={[hubRadius * 0.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={theme.olive700} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, -0.04, 0]}>
          <torusGeometry args={[hubRadius, 0.035, 8, 28]} />
          <meshStandardMaterial color={theme.gold} metalness={0.5} roughness={0.35} />
        </mesh>
        {PRONG_YAWS.map((yaw, index) => (
          <ProngVisual
            key={yaw}
            metal={metal}
            accent={theme.gold}
            groupRef={(group) => {
              prongVisuals.current[index] = group;
            }}
          />
        ))}
      </group>

      <group ref={marker} rotation-x={-Math.PI / 2}>
        <mesh renderOrder={10}>
          <ringGeometry args={[0.26, 0.38, 36]} />
          <meshBasicMaterial
            color={theme.gold}
            transparent
            opacity={0.95}
            depthTest={false}
          />
        </mesh>
        <mesh renderOrder={10} visible={false}>
          <ringGeometry args={[0.2, 0.25, 36]} />
          <meshBasicMaterial
            color={theme.cream}
            transparent
            opacity={0.45}
            depthTest={false}
          />
        </mesh>
      </group>
    </>
  );
};
