// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { GOOD_GRAB_LINES, SO_CLOSE_LINES } from "@/config/copy";
import { INITIAL_GAME_STATE, PROGRESS_STORAGE_KEY, useGameStore } from "./useGameStore";

const machine = { clawStrength: 0, pityThreshold: 3, seed: 2024 };
const heavy = { key: "ramen~x~0~0", weight: 5, slipperiness: 1 };
const game = () => useGameStore.getState();
const gripping = () =>
  useGameStore.setState({ claw: { phase: "gripping", grabbedKey: null, holds: false } });

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState(INITIAL_GAME_STATE);
});

describe("drop", () => {
  it("starts a descent only while the claw is free", () => {
    expect(game().drop()).toBe(true);
    expect(game().claw.phase).toBe("descending");
    expect(game().drop()).toBe(false);
  });

  it("waits while a reveal card is open", () => {
    useGameStore.setState({ reveal: { mode: "decide", prizeId: "ramen", fresh: true } });
    expect(game().drop()).toBe(false);
    expect(game().claw.phase).toBe("idle");
  });

  it("waits after dinner is decided until she plays again", () => {
    useGameStore.setState({ decision: "ramen" });
    expect(game().drop()).toBe(false);
    game().playAgain();
    expect(game().drop()).toBe(true);
  });
});

describe("resolveGrip", () => {
  it("always holds once pity reaches the threshold", () => {
    useGameStore.setState({ pity: 3 });
    gripping();
    const result = game().resolveGrip(heavy, machine);

    expect(result.holds).toBe(true);
    expect(game()).toMatchObject({
      pity: 0,
      claw: { phase: "ascending", grabbedKey: heavy.key, holds: true },
    });
    expect(GOOD_GRAB_LINES).toContain(game().toast?.text);
  });

  it("treats closing on nothing as a gentle miss that builds pity", () => {
    gripping();
    game().resolveGrip(null, machine);

    expect(game()).toMatchObject({ pity: 1, attempts: 1, claw: { phase: "ascending" } });
    expect(SO_CLOSE_LINES).toContain(game().toast?.text);
  });

  it("drives worst-case odds to a win within threshold + 1 grabs", () => {
    let grabs = 0;
    do {
      gripping();
      game().resolveGrip(heavy, machine);
      grabs += 1;
    } while (!game().claw.holds);
    expect(grabs).toBeLessThanOrEqual(machine.pityThreshold + 1);
  });
});

describe("slip", () => {
  it("drops the prize and says so close", () => {
    useGameStore.setState({
      claw: { phase: "ascending", grabbedKey: heavy.key, holds: false },
    });
    game().slip();
    expect(game().claw).toEqual({ phase: "ascending", grabbedKey: null, holds: false });
    expect(SO_CLOSE_LINES).toContain(game().toast?.text);
  });
});

describe("winPrize", () => {
  it("records the decision and opens a fresh reveal in decide mode", () => {
    useGameStore.setState({ pity: 2 });
    game().winPrize({ key: "ramen~x~0~1", prizeId: "ramen" });
    expect(game()).toMatchObject({
      decision: "ramen",
      pity: 0,
      removedKeys: ["ramen~x~0~1"],
      reveal: { mode: "decide", prizeId: "ramen", fresh: true },
    });
  });

  it("ignores the same prize hitting the chute twice", () => {
    game().winPrize({ key: "ramen~x~0~1", prizeId: "ramen" });
    game().closeReveal();
    game().winPrize({ key: "ramen~x~0~1", prizeId: "ramen" });
    expect(game().reveal).toBeNull();
  });

  it("adds each gift to the gift box once in collect mode", () => {
    game().setMode("collect");
    game().winPrize({ key: "letter~x~0~0", prizeId: "letter" });
    game().winPrize({ key: "letter~x~0~1", prizeId: "letter" });
    expect(game().collected).toEqual(["letter"]);
  });
});

describe("rounds and progress", () => {
  it("play again clears the decision and respawns every prize", () => {
    game().winPrize({ key: "ramen~x~0~1", prizeId: "ramen" });
    game().playAgain();
    expect(game()).toMatchObject({
      decision: null,
      reveal: null,
      removedKeys: [],
      spawnEpoch: 1,
      claw: { phase: "idle" },
    });
  });

  it("reset progress clears gifts, the decision, pity and the daily record", () => {
    useGameStore.setState({
      collected: ["a", "b"],
      collectedDays: { a: "2026-02-13", b: "2026-02-14" },
      decision: "ramen",
      decisionDay: "2026-02-14",
      pity: 2,
    });
    game().resetProgress();
    expect(game()).toMatchObject({
      collected: [],
      collectedDays: {},
      decision: null,
      decisionDay: null,
      pity: 0,
    });
  });

  it("switching modes resets the claw and closes any reveal", () => {
    useGameStore.setState({
      claw: { phase: "returning", grabbedKey: "k", holds: true },
      reveal: { mode: "decide", prizeId: "ramen", fresh: false },
    });
    game().setMode("collect");
    expect(game()).toMatchObject({
      mode: "collect",
      reveal: null,
      claw: { phase: "idle" },
    });
  });

  it("saves her progress but not the moment-to-moment claw state", () => {
    game().setMode("collect");
    game().winPrize({ key: "letter~x~0~0", prizeId: "letter" });
    const { state } = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}");
    expect(Object.keys(state).sort()).toEqual(
      [
        "attempts",
        "collected",
        "collectedDays",
        "decision",
        "decisionDay",
        "mode",
        "pity",
      ].sort(),
    );
    expect(state.collected).toEqual(["letter"]);
  });
});

describe("every day", () => {
  const today = "2026-02-14";

  it("remembers the day each gift was collected", () => {
    game().setMode("collect");
    game().winPrize({ key: "letter~x~0~0", prizeId: "letter" }, today);
    expect(game().collectedDays).toEqual({ letter: today });
  });

  it("remembers the day dinner was picked", () => {
    game().winPrize({ key: "ramen~x~0~0", prizeId: "ramen" }, today);
    expect(game()).toMatchObject({ decision: "ramen", decisionDay: today });
  });

  it("lets her pick dinner again on a new day", () => {
    useGameStore.setState({ decision: "ramen", decisionDay: "2026-02-13" });
    game().startDay(today);
    expect(game()).toMatchObject({ decision: null, decisionDay: null, spawnEpoch: 1 });
    expect(game().drop()).toBe(true);
  });

  it("keeps tonight's pick for the rest of today", () => {
    useGameStore.setState({ decision: "ramen", decisionDay: today });
    game().startDay(today);
    expect(game()).toMatchObject({ decision: "ramen", spawnEpoch: 0 });
  });

  it("keeps the claw still while today's gift is already claimed", () => {
    game().setResting(true);
    expect(game().drop()).toBe(false);
    game().setResting(false);
    expect(game().drop()).toBe(true);
  });
});
