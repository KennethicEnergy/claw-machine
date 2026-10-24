import { describe, expect, it } from "vitest";
import { formatCountdown } from "./formatCountdown";

const MINUTE = 60 * 1000;

describe("formatCountdown", () => {
  it("shows hours and minutes", () => {
    expect(formatCountdown(7 * 60 * MINUTE + 42 * MINUTE)).toBe("7h 42m");
  });

  it("drops the hours in the last hour", () => {
    expect(formatCountdown(12 * MINUTE + 30 * 1000)).toBe("13m");
  });

  it("rounds up so it never says 0m too early", () => {
    expect(formatCountdown(59 * MINUTE + 1)).toBe("1h 0m");
  });

  it("says it is nearly time in the final minute", () => {
    expect(formatCountdown(20 * 1000)).toBe("less than a minute");
  });
});
