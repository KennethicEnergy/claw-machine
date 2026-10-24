import type { ClawEvent, ClawPhase, ClawState } from "./types";

export const INITIAL_CLAW_STATE: ClawState = {
  phase: "idle",
  grabbedKey: null,
  holds: false,
};

type Handler = (state: ClawState, event: ClawEvent) => ClawState;

const toPhase =
  (phase: ClawPhase): Handler =>
  (state) => ({ ...state, phase });

const startDescent = toPhase("descending");

const letGo: Handler = (state) => ({ ...state, grabbedKey: null, holds: false });

/**
 * idle -> moving -> descending -> gripping -> ascending -> returning -> releasing -> idle.
 * Events a phase does not list are ignored and return the same state object.
 */
const TRANSITIONS: Record<ClawPhase, Partial<Record<ClawEvent["type"], Handler>>> = {
  idle: { MOVE: toPhase("moving"), DROP: startDescent },
  moving: { STOP: toPhase("idle"), DROP: startDescent },
  descending: { REACHED_BOTTOM: toPhase("gripping") },
  gripping: {
    GRIP_CLOSED: (state, event) =>
      event.type === "GRIP_CLOSED"
        ? { phase: "ascending", grabbedKey: event.grabbedKey, holds: event.holds }
        : state,
  },
  ascending: { SLIPPED: letGo, REACHED_TOP: toPhase("returning") },
  returning: {
    SLIPPED: letGo,
    REACHED_CHUTE: toPhase("releasing"),
  },
  releasing: { RELEASED: () => INITIAL_CLAW_STATE },
};

export const clawTransition = (state: ClawState, event: ClawEvent): ClawState => {
  if (event.type === "RESET") return INITIAL_CLAW_STATE;
  const handler = TRANSITIONS[state.phase][event.type];
  return handler ? handler(state, event) : state;
};

export const canSteer = ({ phase }: ClawState) => phase === "idle" || phase === "moving";

export const canDrop = canSteer;
