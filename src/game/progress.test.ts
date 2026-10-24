import { describe, expect, it } from "vitest";
import { makePrize } from "@/test/fixtures";
import { collectProgress } from "./progress";

const prizes = ["a", "b", "c"].map((id) => makePrize({ id }));

describe("collectProgress", () => {
  it("counts collected gifts against the gift list", () => {
    expect(collectProgress(["a"], prizes)).toEqual({ count: 1, total: 3, done: false });
  });

  it("ignores gifts that were deleted from the config", () => {
    expect(collectProgress(["a", "gone"], prizes)).toEqual({
      count: 1,
      total: 3,
      done: false,
    });
  });

  it("is done when every gift is collected", () => {
    expect(collectProgress(["c", "a", "b"], prizes).done).toBe(true);
  });

  it("is never done with an empty gift list", () => {
    expect(collectProgress([], []).done).toBe(false);
  });
});
