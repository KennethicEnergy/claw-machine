"use client";

import type { CabinetSize } from "@/game/types";
import { isFilled, isPin } from "@/lib/validators";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { DraftText, Section, Slider } from "./fields";

const fixed = (digits: number) => (value: number) => value.toFixed(digits);
const isSeed = (value: string) => /^\d{1,9}$/.test(value);

export const MachineSettings = () => {
  const config = useMachineStore((state) => state.config);
  const updateConfig = useMachineStore((state) => state.updateConfig);
  const setFinalMessage = useMachineStore((state) => state.setFinalMessage);
  const respawnAll = useGameStore((state) => state.respawnAll);
  const {
    title,
    subtitle,
    editPin,
    cabinet,
    clawStrength,
    clawSpeed,
    pityThreshold,
    gravity,
    seed,
  } = config;

  /** Resizing or reseeding moves the walls or spawn spots, so start a fresh round. */
  const updateAndRespawn = (patch: Parameters<typeof updateConfig>[0]) => {
    updateConfig(patch);
    respawnAll();
  };
  const resize = (patch: Partial<CabinetSize>) =>
    updateAndRespawn({ cabinet: { ...cabinet, ...patch } });

  return (
    <div className="space-y-4">
      <Section title="Words">
        <DraftText
          label="Title"
          value={title}
          onCommit={(next) => updateConfig({ title: next })}
          isValid={isFilled}
          maxLength={60}
        />
        <DraftText
          label="Subtitle"
          value={subtitle}
          onCommit={(next) => updateConfig({ subtitle: next })}
          maxLength={120}
        />
        <DraftText
          label="Final message (after every gift)"
          value={config.modes.collect.finalMessage}
          onCommit={setFinalMessage}
          maxLength={1000}
          multiline
        />
      </Section>

      <Section title="Every day">
        <Slider
          label="Gifts per day"
          value={config.giftsPerDay}
          min={0}
          max={10}
          step={1}
          format={(value) => (value === 0 ? "no limit" : `${value} a day`)}
          onChange={(next) => updateConfig({ giftsPerDay: next })}
          hint="After today's gifts, the claw rests until midnight. Dinner picks reset every day too."
        />
      </Section>

      <Section title="The claw">
        <Slider
          label="Claw strength"
          value={clawStrength}
          min={0}
          max={1}
          step={0.05}
          format={fixed(2)}
          onChange={(next) => updateConfig({ clawStrength: next })}
        />
        <Slider
          label="Claw speed"
          value={clawSpeed}
          min={0.5}
          max={6}
          step={0.1}
          format={fixed(1)}
          onChange={(next) => updateConfig({ clawSpeed: next })}
        />
        <Slider
          label="Guaranteed win after"
          value={pityThreshold}
          min={0}
          max={10}
          step={1}
          format={(value) => (value === 0 ? "every grab" : `${value} misses`)}
          onChange={(next) => updateConfig({ pityThreshold: next })}
          hint="Every miss makes the next grab grippier; after this many, the claw always holds."
        />
      </Section>

      <Section title="The cabinet">
        <Slider
          label="Width"
          value={cabinet.width}
          min={4}
          max={9}
          step={0.5}
          format={fixed(1)}
          commitOnRelease
          onChange={(width) => resize({ width })}
        />
        <Slider
          label="Depth"
          value={cabinet.depth}
          min={3}
          max={7}
          step={0.5}
          format={fixed(1)}
          commitOnRelease
          onChange={(depth) => resize({ depth })}
        />
        <Slider
          label="Height"
          value={cabinet.height}
          min={5}
          max={9}
          step={0.5}
          format={fixed(1)}
          commitOnRelease
          onChange={(height) => resize({ height })}
        />
        <Slider
          label="Gravity"
          value={gravity}
          min={1}
          max={30}
          step={0.5}
          format={fixed(1)}
          onChange={(next) => updateConfig({ gravity: next })}
        />
        <DraftText
          label="Shuffle seed"
          value={String(seed)}
          onCommit={(next) => updateAndRespawn({ seed: Number(next) })}
          isValid={isSeed}
          inputMode="numeric"
          hint="Change it to shuffle where prizes land and how grabs roll."
        />
      </Section>

      <Section title="Edit PIN">
        <DraftText
          label="PIN"
          value={editPin}
          onCommit={(next) => updateConfig({ editPin: next })}
          isValid={isPin}
          inputMode="numeric"
          maxLength={8}
          hint="4 to 8 digits. It only stops accidental edits; it isn't real security."
        />
      </Section>
    </div>
  );
};
