import { z } from "zod";
import {
  HEX_COLOR_PATTERN,
  IMAGE_SOURCE_PATTERN,
  PIN_PATTERN,
  WEB_LINK_PATTERN,
} from "@/config/validation";
import { PRIZE_SHAPES } from "./types";
import type { MachineConfig, PrizeConfig, ThemePalette } from "./types";

const ranged = (label: string, min: number, max: number) =>
  z
    .number()
    .min(min, `${label} must be between ${min} and ${max}`)
    .max(max, `${label} must be between ${min} and ${max}`);

const wholeNumber = (label: string, min: number, max: number) => {
  const message = `${label} must be a whole number from ${min} to ${max}`;
  return z.number().int(message).min(min, message).max(max, message);
};

const text = (label: string, max: number) =>
  z
    .string()
    .min(1, `${label} can't be empty`)
    .max(max, `${label} must be ${max} characters or fewer`);

const optionalText = (label: string, max: number) =>
  z.string().max(max, `${label} must be ${max} characters or fewer`).optional();

const hexColor = z.string().regex(HEX_COLOR_PATTERN, "Use a hex color like #6B7A2E");

const webLink = z
  .string()
  .regex(WEB_LINK_PATTERN, "Links must start with http:// or https://");

const imageSource = z
  .string()
  .regex(IMAGE_SOURCE_PATTERN, "Images must be an http(s) URL or an uploaded image");

export const prizeSchema = z.object({
  id: text("Prize id", 64),
  name: text("Name", 40),
  shape: z.enum(PRIZE_SHAPES, {
    error: `Shape must be one of ${PRIZE_SHAPES.join(", ")}`,
  }),
  size: ranged("Size", 0.3, 1.2),
  color: hexColor,
  secondaryColor: hexColor,
  emissive: hexColor.optional(),
  weight: ranged("Weight", 0.1, 5),
  slipperiness: ranged("Slipperiness", 0, 1),
  label: z.string().max(14, "Labels must be 14 characters or fewer"),
  revealTitle: text("Reveal title", 80),
  revealMessage: z.string().max(1000, "Messages must be 1000 characters or fewer"),
  imageUrl: imageSource.optional(),
  link: webLink.optional(),
  redeemNote: optionalText("Redeem note", 160),
  spawnCount: wholeNumber("Spawn count", 1, 8),
}) satisfies z.ZodType<PrizeConfig>;

const prizeListSchema = z.array(prizeSchema).superRefine((prizes, context) => {
  const seen = new Set<string>();
  prizes.forEach(({ id }, index) => {
    if (seen.has(id)) {
      context.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Prize id "${id}" is used twice`,
      });
    }
    seen.add(id);
  });
});

const themeSchema = z.object({
  olive900: hexColor,
  olive700: hexColor,
  olive500: hexColor,
  olive400: hexColor,
  olive300: hexColor,
  olive100: hexColor,
  cream: hexColor,
  gold: hexColor,
  terracotta: hexColor,
}) satisfies z.ZodType<ThemePalette>;

export const machineConfigSchema = z.object({
  revision: wholeNumber("Revision", 1, 1_000_000),
  title: text("Title", 60),
  subtitle: z.string().max(120, "Subtitle must be 120 characters or fewer"),
  editPin: z.string().regex(PIN_PATTERN, "PIN must be 4 to 8 digits"),
  cabinet: z.object({
    width: ranged("Cabinet width", 4, 9),
    depth: ranged("Cabinet depth", 3, 7),
    height: ranged("Cabinet height", 5, 9),
  }),
  clawStrength: ranged("Claw strength", 0, 1),
  clawSpeed: ranged("Claw speed", 0.5, 6),
  pityThreshold: wholeNumber("Pity threshold", 0, 10),
  // Older saved configs predate the daily limit: give them one gift a day.
  giftsPerDay: wholeNumber("Gifts per day", 0, 20).default(1),
  gravity: ranged("Gravity", 1, 30),
  seed: wholeNumber("Seed", 0, 4_294_967_295),
  theme: themeSchema,
  modes: z.object({
    decide: z.object({ prizes: prizeListSchema }),
    collect: z.object({
      prizes: prizeListSchema,
      finalMessage: z
        .string()
        .max(1000, "Final message must be 1000 characters or fewer"),
    }),
  }),
}) satisfies z.ZodType<MachineConfig>;

export type ParseResult =
  { ok: true; config: MachineConfig } | { ok: false; errors: string[] };

/** ["modes", "decide", "prizes", 2, "size"] -> "modes.decide.prizes[2].size" */
const formatPath = (path: readonly PropertyKey[]) =>
  path.reduce<string>(
    (joined, key) =>
      typeof key === "number"
        ? `${joined}[${key}]`
        : joined
          ? `${joined}.${String(key)}`
          : String(key),
    "",
  );

const missingFieldError: z.core.$ZodErrorMap = (issue) =>
  issue.code === "invalid_type" && issue.input === undefined
    ? issue.expected === "object"
      ? "This section is missing"
      : "This field is missing"
    : undefined;

export const parseMachineConfig = (input: unknown): ParseResult => {
  const result = machineConfigSchema.safeParse(input, { error: missingFieldError });
  if (result.success) return { ok: true, config: result.data };
  return {
    ok: false,
    errors: result.error.issues.map(
      ({ path, message }) => `${formatPath(path)}: ${message}`,
    ),
  };
};

export const parseMachineConfigJson = (json: string): ParseResult => {
  try {
    return parseMachineConfig(JSON.parse(json));
  } catch {
    return {
      ok: false,
      errors: ["That file isn't valid JSON. Export a fresh copy and try again."],
    };
  }
};
