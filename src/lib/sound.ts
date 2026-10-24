export type SoundName = "move" | "drop" | "grab" | "slip" | "win" | "celebrate" | "click";

type SoundHandler = (name: SoundName) => void;

let handler: SoundHandler | null = null;

/**
 * Sound stub. Nothing plays until a handler is plugged in, so no audio files
 * are needed. Hook up Web Audio or <audio> elements with setSoundHandler later.
 */
export const setSoundHandler = (next: SoundHandler | null) => {
  handler = next;
};

export const playSound = (name: SoundName) => {
  handler?.(name);
};
