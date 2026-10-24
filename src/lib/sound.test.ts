import { afterEach, describe, expect, it, vi } from "vitest";
import { playSound, setSoundHandler } from "./sound";

describe("playSound", () => {
  afterEach(() => setSoundHandler(null));

  it("does nothing without a handler (no audio files needed)", () => {
    expect(() => playSound("drop")).not.toThrow();
  });

  it("forwards the sound name to a plugged-in handler", () => {
    const handler = vi.fn();
    setSoundHandler(handler);
    playSound("win");
    expect(handler).toHaveBeenCalledWith("win");
  });
});
