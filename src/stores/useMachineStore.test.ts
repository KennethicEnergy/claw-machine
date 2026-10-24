// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@/config/defaultConfig";
import { makeConfig } from "@/test/fixtures";
import { CONFIG_STORAGE_KEY, useMachineStore } from "./useMachineStore";

const machine = () => useMachineStore.getState();
const decidePrizes = () => machine().config.modes.decide.prizes;

beforeEach(() => {
  localStorage.clear();
  useMachineStore.setState({ config: DEFAULT_CONFIG, storageWarning: null });
});

describe("prize editing", () => {
  it("adds a prize from the mode template with a unique id", () => {
    const id = machine().addPrize("decide");
    const added = decidePrizes().at(-1);
    expect(added).toMatchObject({ id, name: "New place" });
    expect(machine().addPrize("decide")).not.toBe(id);
  });

  it("duplicates a prize right after the original", () => {
    const [first] = decidePrizes();
    const copyId = machine().duplicatePrize("decide", first.id);
    expect(decidePrizes()[1]).toMatchObject({ id: copyId, shape: first.shape });
  });

  it("updates, reorders and deletes prizes in the chosen mode only", () => {
    const [first, second] = decidePrizes();
    machine().updatePrize("decide", first.id, { name: "Our ramen place" });
    machine().movePrize("decide", second.id, -1);
    machine().deletePrize("decide", first.id);

    expect(decidePrizes()[0].id).toBe(second.id);
    expect(decidePrizes().some(({ id }) => id === first.id)).toBe(false);
    expect(machine().config.modes.collect).toEqual(DEFAULT_CONFIG.modes.collect);
  });

  it("updates machine settings", () => {
    machine().updateConfig({ title: "Dinner roulette", pityThreshold: 5 });
    expect(machine().config).toMatchObject({
      title: "Dinner roulette",
      pityThreshold: 5,
    });
  });

  it("updates the final message", () => {
    machine().setFinalMessage("All yours.");
    expect(machine().config.modes.collect.finalMessage).toBe("All yours.");
  });
});

describe("import, export and reset", () => {
  it("bumps the revision on export so the file replaces older saved configs", () => {
    const exported = machine().exportConfig();
    expect(exported.revision).toBe(DEFAULT_CONFIG.revision + 1);
    expect(machine().config.revision).toBe(exported.revision);
  });

  it("replaces the config on import", () => {
    const imported = makeConfig({ title: "Imported" });
    machine().importConfig(imported);
    expect(machine().config).toEqual(imported);
  });

  it("resets to the shipped default", () => {
    machine().updateConfig({ title: "Changed" });
    machine().resetConfig();
    expect(machine().config).toEqual(DEFAULT_CONFIG);
  });
});

describe("startup", () => {
  it("keeps edits saved on this device", async () => {
    const saved = { ...DEFAULT_CONFIG, title: "Saved here" };
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ state: { config: saved }, version: 1 }),
    );
    await useMachineStore.persist.rehydrate();
    expect(machine().config.title).toBe("Saved here");
  });

  it("prefers a newer config shipped with the app", async () => {
    const stale = { ...DEFAULT_CONFIG, revision: 0, title: "Stale" };
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ state: { config: stale }, version: 1 }),
    );
    await useMachineStore.persist.rehydrate();
    expect(machine().config).toEqual(DEFAULT_CONFIG);
  });
});
