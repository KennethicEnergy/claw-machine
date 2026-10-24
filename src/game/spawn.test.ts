import { describe, expect, it } from "vitest";
import { makePrize } from "@/test/fixtures";
import { cabinetLayout, isOverChute } from "./layout";
import { buildSpawnPlan, spawnCells } from "./spawn";

const layout = cabinetLayout({ width: 6, depth: 4.5, height: 6.5 });
const plan = (
  prizes = [makePrize()],
  options: { epoch?: number; maxBodies?: number } = {},
) => buildSpawnPlan({ prizes, seed: 7, epoch: 0, layout, maxBodies: 40, ...options });

const countBy = (instances: { prizeId: string }[]) =>
  instances.reduce<Record<string, number>>(
    (counts, { prizeId }) => ({ ...counts, [prizeId]: (counts[prizeId] ?? 0) + 1 }),
    {},
  );

describe("spawnCells", () => {
  it("never places a cell over or right next to the chute", () => {
    expect(spawnCells(layout).some((cell) => isOverChute(cell, layout.chute, 0.35))).toBe(
      false,
    );
  });

  it("lists cells from the middle of the floor outward, so a few prizes stay within reach", () => {
    const distances = spawnCells(layout).map(({ x, z }) => Math.hypot(x, z));
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("keeps every cell inside the glass", () => {
    const inside = spawnCells(layout).every(
      ({ x, z }) =>
        Math.abs(x) < layout.halfWidth - 0.4 && Math.abs(z) < layout.halfDepth - 0.4,
    );
    expect(inside).toBe(true);
  });
});

describe("buildSpawnPlan", () => {
  it("spawns one body per copy", () => {
    const instances = plan([
      makePrize({ id: "a", spawnCount: 3 }),
      makePrize({ id: "b", spawnCount: 1 }),
    ]);
    expect(countBy(instances)).toEqual({ a: 3, b: 1 });
  });

  it("caps the body count and shares the cap fairly", () => {
    const prizes = ["a", "b", "c"].map((id) => makePrize({ id, spawnCount: 8 }));
    expect(countBy(plan(prizes, { maxBodies: 10 }))).toEqual({ a: 4, b: 3, c: 3 });
  });

  it("is reproducible for the same seed and epoch", () => {
    expect(plan()).toEqual(plan());
  });

  it("reshuffles positions on a new epoch", () => {
    expect(plan(undefined, { epoch: 1 })[0].position).not.toEqual(plan()[0].position);
  });

  it("keeps every body above the floor, inside the walls and away from the chute", () => {
    const prizes = ["a", "b", "c", "d", "e"].map((id) =>
      makePrize({ id, spawnCount: 8 }),
    );
    for (const { position } of plan(prizes)) {
      const [x, y, z] = position;
      expect(y).toBeGreaterThan(0.5);
      expect(y).toBeLessThan(layout.restY);
      expect(Math.abs(x)).toBeLessThan(layout.halfWidth - 0.3);
      expect(Math.abs(z)).toBeLessThan(layout.halfDepth - 0.3);
      expect(isOverChute({ x, z }, layout.chute, 0.2)).toBe(false);
    }
  });

  it("only changes the keys of a prize whose body changed", () => {
    const before = plan([makePrize({ id: "a" }), makePrize({ id: "b" })]);
    const after = plan([makePrize({ id: "a", size: 1.1 }), makePrize({ id: "b" })]);
    const keysOf = (instances: typeof before, prizeId: string) =>
      instances.filter((instance) => instance.prizeId === prizeId).map(({ key }) => key);

    expect(keysOf(after, "a")).not.toEqual(keysOf(before, "a"));
    expect(keysOf(after, "b")).toEqual(keysOf(before, "b"));
  });

  it("keeps keys when only the reveal text changes", () => {
    const before = plan([makePrize({ revealMessage: "hi" })]);
    const after = plan([makePrize({ revealMessage: "hello, love" })]);
    expect(after.map(({ key }) => key)).toEqual(before.map(({ key }) => key));
  });

  it("gives every instance a unique key", () => {
    const instances = plan([
      makePrize({ id: "a", spawnCount: 5 }),
      makePrize({ id: "b", spawnCount: 5 }),
    ]);
    expect(new Set(instances.map(({ key }) => key)).size).toBe(10);
  });
});
