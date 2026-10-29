import { describe, expect, it } from "vitest";
import { makePrize } from "@/test/fixtures";
import { collectProgress, mergeProgress } from "./progress";

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

describe("mergeProgress", () => {
  it("keeps gifts won in either copy", () => {
    expect(
      mergeProgress(
        { collected: ["a"], collectedDays: { a: "2026-10-28" } },
        { collected: ["b"], collectedDays: { b: "2026-10-29" } },
      ),
    ).toEqual({
      collected: ["a", "b"],
      collectedDays: { a: "2026-10-28", b: "2026-10-29" },
    });
  });

  it("does not repeat a gift both copies have", () => {
    expect(
      mergeProgress(
        { collected: ["a"], collectedDays: { a: "2026-10-28" } },
        { collected: ["a"], collectedDays: { a: "2026-10-29" } },
      ),
    ).toEqual({ collected: ["a"], collectedDays: { a: "2026-10-28" } });
  });

  it("keeps the current progress when nothing is saved", () => {
    const current = { collected: ["a"], collectedDays: { a: "2026-10-28" } };
    expect(mergeProgress(current)).toEqual(current);
  });
});
