import { describe, expect, it } from "vitest";
import { makePrize } from "@/test/fixtures";
import {
  addPrize,
  createPrizeId,
  duplicatePrize,
  movePrize,
  removePrize,
  updatePrize,
} from "./prizeList";

const list = [makePrize({ id: "a" }), makePrize({ id: "b" }), makePrize({ id: "c" })];
const ids = (prizes: { id: string }[]) => prizes.map(({ id }) => id);

describe("createPrizeId", () => {
  it("slugs the name", () => {
    expect(createPrizeId("Ramen Night!", [])).toBe("ramen-night");
  });

  it("adds a number when the slug is taken", () => {
    expect(createPrizeId("Ramen Night", ["ramen-night", "ramen-night-2"])).toBe(
      "ramen-night-3",
    );
  });

  it("falls back to a generic id for names without letters", () => {
    expect(createPrizeId("💛", [])).toBe("prize");
  });
});

describe("prize list operations", () => {
  it("adds to the end", () => {
    expect(ids(addPrize(list, makePrize({ id: "d" })))).toEqual(["a", "b", "c", "d"]);
  });

  it("duplicates right after the original with a new id and a copy name", () => {
    const result = duplicatePrize(list, "a", "a-2");
    expect(ids(result)).toEqual(["a", "a-2", "b", "c"]);
    expect(result[1].name).toBe("Ramen night (copy)");
  });

  it("removes by id", () => {
    expect(ids(removePrize(list, "b"))).toEqual(["a", "c"]);
  });

  it("moves a prize up or down", () => {
    expect(ids(movePrize(list, "b", -1))).toEqual(["b", "a", "c"]);
    expect(ids(movePrize(list, "b", 1))).toEqual(["a", "c", "b"]);
  });

  it("leaves the list untouched when moving past either end", () => {
    expect(movePrize(list, "a", -1)).toBe(list);
    expect(movePrize(list, "c", 1)).toBe(list);
  });

  it("patches only the matching prize", () => {
    const result = updatePrize(list, "b", { name: "Tacos", size: 1 });
    expect(result[1]).toMatchObject({ id: "b", name: "Tacos", size: 1 });
    expect(result[0]).toBe(list[0]);
  });

  it("ignores unknown ids", () => {
    expect(duplicatePrize(list, "zzz", "zzz-2")).toBe(list);
  });
});
