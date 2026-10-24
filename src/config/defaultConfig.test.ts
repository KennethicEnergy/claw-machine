import { describe, expect, it } from "vitest";
import { parseMachineConfig } from "@/game/schema";
import raw from "./default-config.json";
import { DEFAULT_CONFIG } from "./defaultConfig";

describe("default-config.json", () => {
  it("passes validation (run this after pasting in your exported config)", () => {
    const result = parseMachineConfig(raw);
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("has prizes in both modes", () => {
    expect(DEFAULT_CONFIG.modes.decide.prizes.length).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.modes.collect.prizes.length).toBeGreaterThan(0);
  });
});
