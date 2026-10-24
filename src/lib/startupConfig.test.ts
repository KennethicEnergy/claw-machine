import { describe, expect, it } from "vitest";
import { makeConfig } from "@/test/fixtures";
import { chooseStartupConfig } from "./startupConfig";

const bundled = makeConfig({ revision: 3, title: "Shipped" });

describe("chooseStartupConfig", () => {
  it("keeps edits saved on this device when they are as new as the shipped config", () => {
    const saved = makeConfig({ revision: 3, title: "Edited here" });
    expect(chooseStartupConfig(saved, bundled)).toEqual(saved);
  });

  it("switches to a newer shipped config", () => {
    const saved = makeConfig({ revision: 2, title: "Old" });
    expect(chooseStartupConfig(saved, bundled)).toBe(bundled);
  });

  it("falls back to the shipped config when nothing is saved", () => {
    expect(chooseStartupConfig(undefined, bundled)).toBe(bundled);
  });

  it("falls back to the shipped config when saved data is broken", () => {
    expect(chooseStartupConfig({ title: 42 }, bundled)).toBe(bundled);
  });
});
