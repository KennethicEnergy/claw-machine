import { describe, expect, it } from "vitest";
import { canDrop, canSteer, clawTransition, INITIAL_CLAW_STATE } from "./clawMachine";
import type { ClawEvent, ClawState } from "./types";

const run = (events: ClawEvent[], from: ClawState = INITIAL_CLAW_STATE) =>
  events.reduce(clawTransition, from);

const at = (phase: ClawState["phase"]): ClawState => ({
  phase,
  grabbedKey: null,
  holds: false,
});

describe("clawTransition", () => {
  it("starts idle with nothing in the claw", () => {
    expect(INITIAL_CLAW_STATE).toEqual({ phase: "idle", grabbedKey: null, holds: false });
  });

  it("toggles between idle and moving while steering", () => {
    expect(run([{ type: "MOVE" }]).phase).toBe("moving");
    expect(run([{ type: "MOVE" }, { type: "STOP" }]).phase).toBe("idle");
  });

  it("drops from idle or while moving", () => {
    expect(run([{ type: "DROP" }]).phase).toBe("descending");
    expect(run([{ type: "MOVE" }, { type: "DROP" }]).phase).toBe("descending");
  });

  it("walks the full cycle and carries a held prize to the chute", () => {
    const visited = [
      { type: "DROP" },
      { type: "REACHED_BOTTOM" },
      { type: "GRIP_CLOSED", grabbedKey: "ramen#0", holds: true },
      { type: "REACHED_TOP" },
      { type: "REACHED_CHUTE" },
      { type: "RELEASED" },
    ].reduce<ClawState[]>(
      (states, event) => [...states, clawTransition(states.at(-1)!, event as ClawEvent)],
      [INITIAL_CLAW_STATE],
    );

    expect(visited.map(({ phase }) => phase)).toEqual([
      "idle",
      "descending",
      "gripping",
      "ascending",
      "returning",
      "releasing",
      "idle",
    ]);
    expect(visited[4]).toEqual({
      phase: "returning",
      grabbedKey: "ramen#0",
      holds: true,
    });
    expect(visited[6]).toEqual(INITIAL_CLAW_STATE);
  });

  it("lets go of the prize when it slips on the way up", () => {
    const state = run([
      { type: "DROP" },
      { type: "REACHED_BOTTOM" },
      { type: "GRIP_CLOSED", grabbedKey: "plush#1", holds: false },
      { type: "SLIPPED" },
    ]);
    expect(state).toEqual({ phase: "ascending", grabbedKey: null, holds: false });
  });

  it("can close on nothing and still finish the cycle", () => {
    const state = run([
      { type: "DROP" },
      { type: "REACHED_BOTTOM" },
      { type: "GRIP_CLOSED", grabbedKey: null, holds: false },
      { type: "REACHED_TOP" },
      { type: "REACHED_CHUTE" },
      { type: "RELEASED" },
    ]);
    expect(state).toEqual(INITIAL_CLAW_STATE);
  });

  it("ignores steering and extra drops once the claw is busy", () => {
    const descending = at("descending");
    expect(clawTransition(descending, { type: "MOVE" })).toBe(descending);
    expect(clawTransition(descending, { type: "DROP" })).toBe(descending);
  });

  it("ignores events that do not belong to the current phase", () => {
    const idle = at("idle");
    expect(clawTransition(idle, { type: "REACHED_TOP" })).toBe(idle);
    expect(clawTransition(idle, { type: "RELEASED" })).toBe(idle);
  });

  it("resets from any phase", () => {
    const returning: ClawState = {
      phase: "returning",
      grabbedKey: "gift#0",
      holds: true,
    };
    expect(clawTransition(returning, { type: "RESET" })).toEqual(INITIAL_CLAW_STATE);
  });
});

describe("phase guards", () => {
  it("only steers and drops while the claw is free", () => {
    expect(canSteer(at("idle"))).toBe(true);
    expect(canSteer(at("moving"))).toBe(true);
    expect(canSteer(at("ascending"))).toBe(false);
    expect(canDrop(at("moving"))).toBe(true);
    expect(canDrop(at("releasing"))).toBe(false);
  });
});
