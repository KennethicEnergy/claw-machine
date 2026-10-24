"use client";

import { useState } from "react";
import { PRIZE_SWATCHES } from "@/config/theme";
import { PRIZE_SHAPES } from "@/game/types";
import type { ModeId, PrizeConfig, PrizeShape } from "@/game/types";
import { imageFileToDataUrl } from "@/lib/image";
import { isFilled, isOptionalImageUrl, isOptionalWebLink } from "@/lib/validators";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button } from "../ui/Button";
import {
  ColorField,
  DraftText,
  Field,
  Section,
  SelectField,
  Slider,
  Toggle,
} from "./fields";

const SHAPE_LABELS: Record<PrizeShape, string> = {
  sphere: "Ball",
  box: "Box",
  capsule: "Capsule",
  cylinder: "Cup",
  plush: "Plush (with ears)",
  gift: "Gift box",
  "capsule-ball": "Gacha capsule",
};

const SHAPE_OPTIONS = PRIZE_SHAPES.map((value) => ({
  value,
  label: SHAPE_LABELS[value],
}));

const fixed = (digits: number) => (value: number) => value.toFixed(digits);

/** Empty optional text is stored as "not set" so the reveal card can skip it. */
const optional = (value: string) => (value === "" ? undefined : value);

type PrizeEditorProps = {
  mode: ModeId;
  prize: PrizeConfig;
};

export const PrizeEditor = ({ mode, prize }: PrizeEditorProps) => {
  const updatePrize = useMachineStore((state) => state.updatePrize);
  const [imageError, setImageError] = useState<string | null>(null);
  const update = (patch: Partial<PrizeConfig>) => updatePrize(mode, prize.id, patch);
  const uploaded = prize.imageUrl?.startsWith("data:") ?? false;

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    try {
      update({ imageUrl: await imageFileToDataUrl(file) });
    } catch {
      setImageError("That photo couldn't be read. Try a JPG or PNG.");
    }
  };

  return (
    <div className="space-y-4">
      <Section title="Looks">
        <DraftText
          label="Name"
          value={prize.name}
          onCommit={(name) => update({ name })}
          isValid={isFilled}
          maxLength={40}
        />
        <DraftText
          label="Label on the prize"
          value={prize.label}
          onCommit={(label) => update({ label })}
          maxLength={14}
          hint="Short and sweet, up to 14 characters."
        />
        <SelectField
          label="Shape"
          value={prize.shape}
          options={SHAPE_OPTIONS}
          onChange={(shape) => update({ shape })}
        />
        <Slider
          label="Size"
          value={prize.size}
          min={0.3}
          max={1.2}
          step={0.05}
          format={fixed(2)}
          onChange={(size) => update({ size })}
        />
        <ColorField
          label="Color"
          value={prize.color}
          swatches={PRIZE_SWATCHES}
          onChange={(color) => update({ color })}
        />
        <ColorField
          label="Second color"
          value={prize.secondaryColor}
          swatches={PRIZE_SWATCHES}
          onChange={(secondaryColor) => update({ secondaryColor })}
        />
        <Toggle
          label="Soft glow"
          checked={prize.emissive !== undefined}
          onChange={(on) => update({ emissive: on ? prize.color : undefined })}
        />
        {prize.emissive !== undefined && (
          <ColorField
            label="Glow color"
            value={prize.emissive}
            swatches={PRIZE_SWATCHES}
            onChange={(emissive) => update({ emissive })}
          />
        )}
      </Section>

      <Section title="How it plays">
        <Slider
          label="Weight"
          value={prize.weight}
          min={0.1}
          max={5}
          step={0.1}
          format={fixed(1)}
          onChange={(weight) => update({ weight })}
        />
        <Slider
          label="Slipperiness"
          value={prize.slipperiness}
          min={0}
          max={1}
          step={0.05}
          format={fixed(2)}
          onChange={(slipperiness) => update({ slipperiness })}
          hint="She still always wins; slippery prizes just need an extra try or two."
        />
        <Slider
          label="How many in the machine"
          value={prize.spawnCount}
          min={1}
          max={8}
          step={1}
          onChange={(spawnCount) => update({ spawnCount })}
        />
      </Section>

      <Section title="The reveal">
        <DraftText
          label="Reveal title"
          value={prize.revealTitle}
          onCommit={(revealTitle) => update({ revealTitle })}
          isValid={isFilled}
          maxLength={80}
        />
        <DraftText
          label="Your note to her"
          value={prize.revealMessage}
          onCommit={(revealMessage) => update({ revealMessage })}
          maxLength={1000}
          multiline
        />
        {mode === "collect" && (
          <DraftText
            label="Redeem note"
            value={prize.redeemNote ?? ""}
            onCommit={(redeemNote) => update({ redeemNote: optional(redeemNote) })}
            maxLength={160}
            placeholder="Valid for one weekend trip"
          />
        )}
        <DraftText
          label={mode === "decide" ? "Map link" : "Link"}
          value={prize.link ?? ""}
          onCommit={(link) => update({ link: optional(link) })}
          isValid={isOptionalWebLink}
          type="url"
          placeholder="https://maps.google.com/…"
        />
        <Field label="Photo">
          {prize.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs and any host
            <img
              src={prize.imageUrl}
              alt=""
              className="mt-2 max-h-36 w-full rounded-xl object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={({ target }) => void handleUpload(target.files?.[0])}
            className="mt-2 block w-full text-sm text-olive-700 file:mr-3 file:rounded-full file:border-0 file:bg-olive-700 file:px-4 file:py-2 file:font-bold file:text-cream"
          />
          {imageError && (
            <span className="mt-1 block rounded-xl bg-terracotta/20 px-3 py-1 text-sm font-bold text-olive-900">
              {imageError}
            </span>
          )}
        </Field>
        {!uploaded && (
          <DraftText
            label="…or an image link"
            value={prize.imageUrl ?? ""}
            onCommit={(imageUrl) => update({ imageUrl: optional(imageUrl) })}
            isValid={isOptionalImageUrl}
            type="url"
            placeholder="https://…"
          />
        )}
        {prize.imageUrl && (
          <Button
            variant="ghost"
            className="px-3 py-1 text-sm"
            onClick={() => update({ imageUrl: undefined })}
          >
            Remove photo
          </Button>
        )}
      </Section>
    </div>
  );
};
