import { describe, expect, it } from "vitest";
import { pickLine } from "./pickLine";

describe("pickLine", () => {
  const lines = ["one", "two", "three"];

  it("cycles through the lines by index", () => {
    expect([0, 1, 2, 3].map((index) => pickLine(lines, index))).toEqual([
      "one",
      "two",
      "three",
      "one",
    ]);
  });
});
