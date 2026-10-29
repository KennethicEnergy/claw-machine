import { describe, expect, it } from "vitest";
import {
  claimsOn,
  dailyGiftStatus,
  dayKey,
  giftsAllowedOn,
  isStaleDecision,
  msUntilNextDay,
} from "./daily";

describe("dayKey", () => {
  it("formats the local calendar day", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(dayKey(new Date(2026, 10, 23, 0, 0))).toBe("2026-11-23");
  });
});

describe("msUntilNextDay", () => {
  it("counts down to the next local midnight", () => {
    expect(msUntilNextDay(new Date(2026, 0, 5, 23, 0, 0))).toBe(60 * 60 * 1000);
    expect(msUntilNextDay(new Date(2026, 0, 5, 0, 0, 0))).toBe(24 * 60 * 60 * 1000);
  });
});

describe("claimsOn", () => {
  it("counts gifts collected on a given day", () => {
    const days = { letter: "2026-02-13", movie: "2026-02-14", getaway: "2026-02-14" };
    expect(claimsOn(days, "2026-02-14")).toBe(2);
    expect(claimsOn(days, "2026-02-15")).toBe(0);
  });
});

describe("dailyGiftStatus", () => {
  const today = "2026-02-14";

  it("rests once today's gifts are claimed", () => {
    expect(
      dailyGiftStatus({ collectedDays: { letter: today }, giftsPerDay: 1, today }),
    ).toEqual({
      claimedToday: 1,
      resting: true,
    });
  });

  it("is open when today's gift is still waiting", () => {
    const status = dailyGiftStatus({
      collectedDays: { letter: "2026-02-13" },
      giftsPerDay: 1,
      today,
    });
    expect(status).toEqual({ claimedToday: 0, resting: false });
  });

  it("never rests without a daily limit", () => {
    const collectedDays = { a: today, b: today, c: today };
    expect(dailyGiftStatus({ collectedDays, giftsPerDay: 0, today }).resting).toBe(false);
  });
});

describe("isStaleDecision", () => {
  it("expires a dinner pick from an earlier day", () => {
    expect(isStaleDecision("ramen", "2026-02-13", "2026-02-14")).toBe(true);
  });

  it("keeps tonight's pick", () => {
    expect(isStaleDecision("ramen", "2026-02-14", "2026-02-14")).toBe(false);
  });

  it("treats a pick saved before days were tracked as stale", () => {
    expect(isStaleDecision("ramen", null, "2026-02-14")).toBe(true);
  });

  it("has nothing to expire without a pick", () => {
    expect(isStaleDecision(null, null, "2026-02-14")).toBe(false);
  });
});

describe("giftsAllowedOn", () => {
  const extraGifts = { "2026-10-29": 1 };

  it("adds the extra gifts on their day", () => {
    expect(giftsAllowedOn({ giftsPerDay: 1, extraGifts }, "2026-10-29")).toBe(2);
  });

  it("is the daily limit on other days", () => {
    expect(giftsAllowedOn({ giftsPerDay: 1, extraGifts }, "2026-10-30")).toBe(1);
    expect(giftsAllowedOn({ giftsPerDay: 1 }, "2026-10-29")).toBe(1);
  });

  it("stays unlimited without a daily limit", () => {
    expect(giftsAllowedOn({ giftsPerDay: 0, extraGifts }, "2026-10-29")).toBe(0);
  });
});
